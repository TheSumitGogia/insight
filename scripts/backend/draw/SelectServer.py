import urlparse, urllib
import json
import pickle, sys
import structs
import numpy as np
from Classification import SVMClassifier, SelPClassifier
from Processing import NPProcessor, DictProcessor
from BaseHTTPServer import HTTPServer, BaseHTTPRequestHandler
import matplotlib.pyplot as plt
from matplotlib.patches import Ellipse

# classifier settings
classifier = None
positive = True 
ctrees = True 
clf_type = SelPClassifier

# feature processing settings
processor = DictProcessor()

# test mode settings
tester = None
test_type = None
test_props = ['fillColor_0', 'fillColor_1', 'fillColor_2']

# save mode settings
tree_dir = "../../../../trees"
tree_ext = ".tree"

# modes
testing = False
saving = False

def export_trees(image, features):
    trees = {prop: structs.NClusterTree(features[prop]) for prop in features.keys()}
    exp_file = open(tree_dir + "/" + image + tree_ext, "w")
    pickle.dump(trees, exp_file) 
    exp_file.close()

def import_trees(image):
    imp_file = open(tree_dir + "/" + image + tree_ext, "r")
    trees = pickle.load(imp_file)
    imp_file.close()
    return trees

class SelectionHandler(BaseHTTPRequestHandler):

    def do_GET(self):
        global classifier

        get_data = urllib.unquote(urlparse.urlparse(self.path).query)
        data = json.loads(get_data)
        message = data['message']

        if message == 'selection':
            print "**SELECTION REQUEST**"
            if classifier is not None:
                selection = classifier.get_selection()
                self.__send_data(selection)
                print "Response:", selection
            else:
                self.__send_data("success")

    def do_POST(self):
        global testing, saving

        length = int(self.headers.get('content-length'))
        pre_data = self.rfile.read(length)
        data = json.loads(pre_data)
        message = data['message']

        if saving:
            self.__save_POST(data, message)
        elif testing:
            self.__test_POST(data, message)
        else:
            self.__basic_POST(data, message)

    def __save_POST(self, data, message):
        global processor
        if message == 'data':
            print "**SAVE DATA REQUEST**"
            named_features = data['features']
            if len(named_features) != 0:
                out_image = data['image']
                features = processor.process(named_features, group=['fillColor', 'shape', 'strokeColor'])
                export_trees(out_image, features)
            self.__send_data("success")
        elif message  == 'reset':
            self.__send_data("success")

    def __test_POST(self, data, message):
        global classifier, tester, test_type
        self.__basic_POST(data, message)
        if classifier is not None:
            if message == 'data':
                plt.close()
                tester = test_type(classifier, ['fillColor_0', 'fillColor_1', 'fillColor_2'])
            if message == 'add_example':
                tester.update(classifier)
            if message == 'pop_example':
                tester.update(classifier)
            if message == 'reset':
                tester.update(classifier)

    def __basic_POST(self, data, message):
        global classifier, processor, clf_type, positive, ctrees 
        if message == 'data':
            print "**DATA REQUEST**"
            named_features = data['features']
            if len(named_features) != 0:
                features = processor.process(named_features)
                if ctrees:
                    image = data['image']
                    trees = import_trees(image)
                    classifier = clf_type(None, trees=trees)
                else:
                    classifier = clf_type(features)
            self.__send_data("success")
        elif message == 'add_example':
            print "**ADD EXAMPLE REQUEST**"
            print "Request:", data
            if classifier is not None:
                if positive:
                    if data['polarity'] > 0:
                        classifier.add_example(data['object'])
                else:
                    classifier.add_example(data['object'], data['polarity'])
                selection = classifier.get_selection()
                self.__send_data(selection)
                #print "Response:", selection
            else:
                self.__send_data("success")
        elif message == 'pop_example':
            print "**POP EXAMPLE REQUEST**"
            print "Request:", data
            if classifier is not None:
                classifier.pop_example()
                selection = classifier.get_selection()
                self.__send_data(selection)
                #print "Response:", selection
            else:
                self.__send_data("success")
        elif message == 'reset':
            print "**RESET REQUEST**"
            if classifier is not None:
                classifier.reset()
            self.__send_data("success")

    def __send_headers(self):
        self.send_response(200, "ok")
        self.send_header('Access-Control-Allow-Credentials', 'true')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', """X-Requested-With,
                Content-type, Content-length""")
        self.send_header('Content-Type', 'application/json')

    def __send_data(self, data):
        self.__send_headers()
        self.end_headers()
        json.dump({"result": data}, self.wfile)
        self.wfile.close()

class PTester:
    def __init__(self, clf, props):
        plt.ion()
        trees = {prop: clf.get_pclf(prop).get_tree() for prop in props}

        self.figure, self.axes = plt.subplots(1, len(props), sharey=True)
        self.ellipses = {prop: {} for prop in props}
        self.run(trees)

    def run(self, trees):
        self.__draw_trees(trees)
        plt.draw()

    def update(self, clf):
        print 'scores', clf.get_scores()
        self.__render(clf)

    def __render(self, clf):
        props = sorted(self.ellipses.keys())
        for prop in props:
            ellipses = self.ellipses[prop]
            new_clusters = clf.get_pclf(prop).get_clusters()
            for cluster in ellipses:
                ellipse = ellipses[cluster]
                ellipse.set_facecolor([0.0, 0.0, 1.0])

            for cluster in new_clusters:
                ellipse = ellipses[cluster.id]
                ellipse.set_facecolor([0.0, 1.0, 0.0])
        self.figure.canvas.draw()

    def __draw_trees(self, trees):
        datas = self.__get_aux_data(trees)
        props = sorted(trees.keys())
        for i in range(len(props)):
            axes, prop = self.axes[i], props[i]
            tree, data = trees[prop], datas[prop]
            axes.set_title(prop)
            self.__draw_data_points(axes, data)
            ellipses = self.__draw_ellipses(axes, tree)
            self.ellipses[prop] = ellipses

    def __draw_ellipses(self, axes, tree):
        clusters = tree.clusters
        max_level = tree.max_level
        ellipses = {}
        for cid in clusters:
            cluster = clusters[cid]
            ellipse = self.__draw_ellipse(axes, max_level, cluster)
            ellipses[cid] = ellipse
        return ellipses

    def __draw_ellipse(self, axes, mlevel, cluster):
        x = 0.5 * (cluster.data[0] + cluster.data[1])
        rng = cluster.data[1] - cluster.data[0]
        y = .25 + (cluster.level - 1) * 1.5 / (mlevel - 1) 
        height = 1.5 / (mlevel - 1)
        ell = Ellipse(xy=[x,y], width=rng, height=height, angle=0)
        axes.add_artist(ell)
        ell.set_clip_box(axes.bbox)
        ell.set_alpha(0.5)
        ell.set_facecolor([0, 0, 1.0])
        return ell

    def __draw_data_points(self, axes, data):
        rng = [np.min(data), np.max(data)]
        offset, length = [1], [2.0]
        axes.hlines(0.1, rng[0], rng[1])
        axes.set_xlim(list(rng))
        axes.set_ylim([0, 2.0])

        axes.eventplot(data.copy(), lineoffsets=offset, linelengths=length, orientation='horizontal', colors='b')
        axes.get_yaxis().set_visible(False)

    def __get_aux_data(self, trees):
        sort_data = {prop: trees[prop].data.T[0] for prop in trees}
        data_map = {prop: np.array([trees[prop].translate(i) for i in range(sort_data[prop].shape[0])]) for prop in trees}
        datas = {prop: sort_data[prop][data_map[prop]] for prop in trees}
        ranges = {prop: [np.min(datas[prop]), np.max(datas[prop])] for prop in datas}
        return datas

class PNTester:
    def __init__(self, clf, props):
        plt.ion()
        trees = {prop: clf.get_pclf(prop).get_tree() for prop in props}

        self.figure, self.axes = plt.subplots(2, len(props), sharey=True)
        self.ellipses = { \
            'positive': {prop: {} for prop in props}, \
            'negative': {prop: {} for prop in props} \
        }
        self.run(trees)

    def run(self, trees):
        self.__draw_trees(trees)
        plt.draw()

    def update(self, clf):
        print 'scores', clf.get_scores()
        self.__render(clf)

    def __render(self, clf):
        props = sorted(self.ellipses.keys())
        tp = ['positive', 'negative']
        for t in tp:
            t_ellipses = self.ellipses[t]
            props = sorted(t_ellipses.keys())
            for prop in props:
                ellipses = t_ellipses[prop]
                if t == 'positive':
                    new_clusters = clf.get_pclf(prop).get_pclusters()
                else:
                    new_clusters = clf.get_pclf(prop).get_nclusters()
                for cluster in ellipses:
                    ellipse = ellipses[cluster]
                    ellipse.set_facecolor([0.0, 0.0, 1.0])

                for cluster in new_clusters:
                    ellipse = ellipses[cluster.id]
                    ellipse.set_facecolor([0.0, 1.0, 0.0])
        self.figure.canvas.draw()

    def __draw_trees(self, trees):
        datas = self.__get_aux_data(trees)
        props = sorted(trees.keys())
        tp = ['positive', 'negative']
        for t_idx in range(len(tp)):
            t = tp[t_idx]
            for i in range(len(props)):
                axes, prop = self.axes[t_idx][i], props[i]
                tree, data = trees[prop], datas[prop]
                axes.set_title(t[0] + '_' + prop)
                self.__draw_data_points(axes, data)
                ellipses = self.__draw_ellipses(axes, tree)
                self.ellipses[t][prop] = ellipses

    def __draw_ellipses(self, axes, tree):
        clusters = tree.clusters
        max_level = tree.max_level
        ellipses = {}
        for cid in clusters:
            cluster = clusters[cid]
            ellipse = self.__draw_ellipse(axes, max_level, cluster)
            ellipses[cid] = ellipse
        return ellipses

    def __draw_ellipse(self, axes, mlevel, cluster):
        x = 0.5 * (cluster.data[0] + cluster.data[1])
        rng = cluster.data[1] - cluster.data[0]
        y = .25 + (cluster.level - 1) * 1.5 / (mlevel - 1) 
        height = 1.5 / (mlevel - 1)
        ell = Ellipse(xy=[x,y], width=rng, height=height, angle=0)
        axes.add_artist(ell)
        ell.set_clip_box(axes.bbox)
        ell.set_alpha(0.5)
        ell.set_facecolor([0, 0, 1.0])
        return ell

    def __draw_data_points(self, axes, data):
        rng = [np.min(data), np.max(data)]
        offset, length = [1], [2.0]
        axes.hlines(0.1, rng[0], rng[1])
        axes.set_xlim(list(rng))
        axes.set_ylim([0, 2.0])

        axes.eventplot(data.copy(), lineoffsets=offset, linelengths=length, orientation='horizontal', colors='b')
        axes.get_yaxis().set_visible(False)

    def __get_aux_data(self, trees):
        sort_data = {prop: trees[prop].data.T[0] for prop in trees}
        data_map = {prop: np.array([trees[prop].translate(i) for i in range(sort_data[prop].shape[0])]) for prop in trees}
        datas = {prop: sort_data[prop][data_map[prop]] for prop in trees}
        ranges = {prop: [np.min(datas[prop]), np.max(datas[prop])] for prop in datas}
        return datas

if  __name__ == '__main__':
    options = sys.argv[1:]
    for option in options:
        if option == '-t':
            test_type = PTester
            testing = True
        if option == '-s':
            saving = True
    HTTPD = HTTPServer(('localhost', 1025), SelectionHandler).serve_forever()
