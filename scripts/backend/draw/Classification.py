import numpy as np
import numpy.random as rnd
from sklearn import svm
from sklearn.linear_model import SGDClassifier
from sklearn.cluster import KMeans
from structs import ClusterTree
from collections import defaultdict

class LRClassifier():
    nex_w_factor = 1

    def __init__(self, data):
        self.__data = data
        self.__weights = np.ones((data.shape[0], 1)) * (1.0 / data.shape[0]) * self.nex_w_factor
        self.__labels = np.ones((data.shape[0], 1)) * -1
        self.__examples = []
        self.__selection = []
        self.__clf = SGDClassifier(loss='log')

    def add_example(self, object_id):
        self.__examples.append(object_id)
        self.__reselect()

    def __reselect(self):
        if len(self.__examples) == 0:
            self.__weights = np.ones((data.shape[0], 1)) * (1.0 / data.shape[0]) * self.nex_w_factor
            self.__labels = np.ones((data.shape[0], 1)) * -1
            self.__selection = []
            return

        # go through examples, count
        # weights for each example = count
        # labels for each example = 1
        counts = defaultdict(int) 
        for obj in examples:
            counts[obj] += 1
        for obj in counts:
            self.__weights[obj, 1] = counts[obj]
            self.__labels[obj, 1] = 1
        self.__clf.fit(self.__data, self.__labels, sample_weight=self.__weights) 
        labels = self.__clf.predict(self.__data)
        self.__selection = np.where(labels==1)[0].tolist() 

    def pop_example(self):
        self.__examples.pop()
        self.__reselect()

    def get_selection(self):
        return self.__selection[:]

    def get_examples(self):
        return self.__examples[:]

    def reset(self):
        self.__weights = np.ones((data.shape[0], 1)) * (1.0 / data.shape[0]) * self.nex_w_factor
        self.__labels = np.ones((data.shape[0], 1)) * -1
        self.__selection = []
        self.__examples = []
        self.__clf = SGDClassifier(loss='log')

class SVMClassifier():

    def __init__(self, data):
        self.__data = data
        self.__examples = []
        self.__selection = []
        self.__clf = svm.SVC()

    def add_example(self, object_id, polarity):
        # add example
        self.__examples.append({
            'object': object_id,
            'polarity': polarity
        })

        self.__reselect()

    def __reselect(self):
        positives = filter(lambda ex: ex['polarity'] == 1, self.__examples)
        positives = map(lambda ex: ex['object'], positives)
        if len(positives) == len(self.__examples) or len(positives) == 0:
            self.__selection = positives[:]
            return

        # fit svm with examples
        ex_data = self.__data[map(lambda ex: ex['object'], self.__examples)]
        ex_labels = np.array(map(lambda ex: ex['polarity'], self.__examples))
        self.__clf.fit(ex_data, ex_labels)

        labels = self.__clf.predict(self.__data)
        self.__selection = np.where(labels==1)[0].tolist()

    def pop_example(self):
        self.__examples.pop()
        self.__reselect()

    def get_selection(self):
        return self.__selection[:]

    def get_examples(self):
        return self.__examples[:]

    def reset(self):
        self.__selection = []
        self.__examples = []
        self.__clf = svm.SVC()

class PClassifier:
    constantLength = 2
    def __init__(self, data, tree=None):
        self.__selection = set()

        self.__examples = []
        
        if tree is not None:
            self.__tree = tree
        else:
            self.__tree = ClusterTree(data)
        self.__clusters = None
        
        self.__weights = [-1.0, 1.0, 0.667]
        self.__constant, self.__constantCount = False, 0
        self.__oldconstant, self.__oldconscount = False, 0
        self.__score = None

    '''
    ACCESSORS
    '''
    def get_tree(self):
        # TODO: should be copied
        return self.__tree

    def get_selection(self):
        return list(self.__selection)

    def get_clusters(self):
        return list(self.__clusters)

    def get_examples(self):
        return list(self.__examples)

    def set_weights(self, weights):
        self.__weights = list(weights)

    def get_score(self):
        return self.__score

    def get_constant(self):
        return self.__constant

    '''
    ACT
    '''
    def add_example(self, example):
        self.__examples.append(example)
        self.__recluster()
        self.__reselect()

    def pop_example(self):
        self.__examples.pop()
        self.__constant = self.__oldconstant
        self.__constantCount = self.__oldconscount
        if len(self.__examples) == 0:
            self.__selection = set()
            self.__clusters = None
            self.__score = None
            return
        self.__recluster()
        self.__reselect()

    def reset(self):
        self.__selection = set()
        self.__examples = []

        self.__clusters = None

        self.__weights = [-1.0, 1.0, 0.667]
        self.__score = None

    def __recluster(self):
        tree = self.__tree
        nclusters, scores = self.__climb(tree)
        self.__oldconscount = self.__constantCount
        self.__oldconstant = self.__constant
        if (self.__clusters is not None and set(nclusters) == set(self.__clusters)):
            self.__constantCount += 1
            if self.__constantCount >= self.constantLength:
                self.__constant = True
            else:
                self.__constant = False
                self.__constantCount = 1
        else:
            self.__constant = False
            self.__constantCount = 1
        self.__clusters = nclusters 
        self.__score = self.__aggregate_score(scores)

    def __reselect(self):
        self.__selection = set()
        for cluster in self.__clusters:
            self.__selection.update(self.__tree.get_children(cluster))

    def __climb(self, tree):
        def climb_condition(cluster):
            condition = (cluster is not None \
                and cluster.ccount == cluster.ecount)
            return condition

        def merge(cluster):
            cluster.parent.collect.update(cluster.collect)
            wavg_prev = cluster.parent.max_score * (cluster.parent.ecount - cluster.ecount)
            wavg_new = cluster.max_score * cluster.ecount
            cluster.parent.max_score = (wavg_prev + wavg_new) / cluster.parent.ecount
            top.remove(cluster.parent.id)

        examples, scoref = self.__examples, self.__cluster_score

        clusters = [tree.leaves[tree.translate(example)] for example in examples]
        self.__augment_counts(tree, examples)
        # remove duplicate clusters and sort
        clusters = list(set(clusters))
        # clusters.sort(key=lambda cluster: cluster.data[0])
        for cluster in clusters:
            cluster.ccount = cluster.ecount

        # climb tree and collect best clusters
        top = set()
        for cidx in range(len(clusters)):
            cluster = clusters[cidx]
            while (climb_condition(cluster)):
                # print 'climb', cluster.id
                score = self.__cluster_score(cluster)
                if score >= cluster.max_score:
                    cluster.max_score = score
                    cluster.collect = {cluster.id: score}
                if cluster.parent is not None:
                    cluster.parent.ccount += cluster.ecount
                    if cluster.parent.ccount != cluster.parent.ecount or cluster.parent.ccount == cluster.ccount:
                        cluster.parent.collect = cluster.collect
                        cluster.parent.max_score = cluster.max_score
                    else:
                        merge(cluster)
                cluster = cluster.parent
            if cluster is not None:
                top.add(cluster.id)
            else:
                top.add(tree.root.id)
        rclusters, rscores = self.__aggregate_clusters(tree, top)
        self.__clean_tree(tree, examples)
    
        return rclusters, rscores

    def __clean_tree(self, tree, examples):
        clusters = [tree.leaves[tree.translate(example)] for example in examples]
        traces = [tree.trace(tree.root, cluster) for cluster in clusters]
        seen = set()
        for trace in traces:
            for cluster in trace:
                if cluster.id not in seen:
                    seen.add(cluster.id)
                    del cluster.ccount; del cluster.ecount
                    del cluster.collect; del cluster.max_score
        
    def __aggregate_clusters(self, tree, top):
        chosen = {}
        for cid in top:
            chosen.update(tree.clusters[cid].collect)
        cids = sorted(chosen.keys())
        clusters = [tree.clusters[cid] for cid in cids]
        scores = [chosen[cid] for cid in cids]
        return clusters, scores

    def __augment_counts(self, tree, examples):
        traces = [tree.trace(tree.root, tree.leaves[tree.translate(example)]) for example in examples]
        counts = defaultdict(int)
        for trace in traces:
            for cluster in trace:
                counts[cluster.id] += 1
        for cid in counts:
            cluster = tree.clusters[cid]
            cluster.ecount = counts[cid]
            cluster.ccount = 0
            cluster.max_score = -9000
            cluster.collect = None

    def __cluster_score(self, cluster):
        weights = self.__weights
        score = (weights[0]*cluster.range + weights[1]*cluster.count) * weights[2] * cluster.ecount
        return score

    def __aggregate_score(self, scores):
        return sum(scores) / len(scores)

class SelPClassifier:
    def __init__(self, objects, trees=None):
        # create property classifiers

        if trees is not None:
            self.__prop_clfs = {feature: PClassifier(None, trees[feature]) for feature in trees}
            self.__features = trees.keys()
            self.__count = trees[self.__features[0]].data.shape[0]
        else:
            features = objects[0].keys()
            data_map = {feature: np.array([objects[obj][feature] for obj in range(len(objects))]) for feature in features}
            self.__prop_clfs = {feature: PClassifier(data_map[feature]) for feature in features} 
            self.__count = len(objects)

        self.__selection = set()
        self.__examples = []
        self.__sel_cluster = KMeans(n_clusters=2, n_init=3, max_iter=100)

        self.__threshold = 0.3

    def add_example(self, example):
        self.__examples.append(example)
        for prop in self.__prop_clfs:
            clf = self.__prop_clfs[prop]
            clf.add_example(example)
        self.__reselect()

    def pop_example(self):
        self.__examples.pop()
        for prop in self.__prop_clfs:
            clf = self.__prop_clfs[prop]
            clf.pop_example()
        self.__reselect()

    def __reselect(self):
        if len(self.__examples) == 0:
            self.__selection = set()
            return
        self.__selection = set(range(self.__count))
        scores = self.get_scores()
        # print 'Select Classifier scores:', scores
        sorted_props = sorted(self.__prop_clfs.keys())
        score_data = np.array([[scores[sorted_props[i]]] for i in range(len(sorted_props))])
        score_data[score_data > 10] = 0

        s_clusters = self.__sel_cluster.fit_predict(score_data)
        low, high = np.where(s_clusters==0)[0], np.where(s_clusters==1)[0]
        use = high if np.max(score_data[low, :]) < np.min(score_data[high, :]) else low
        props = [sorted_props[i] for i in use]
        for prop in sorted_props:
            if self.__prop_clfs[prop].get_constant():
                props.append(prop)
        props = list(set(props))
        # print 'chosen select props:', props
        for prop in props:
            clf = self.__prop_clfs[prop]
            self.__selection.intersection_update(set(clf.get_selection()))

    def get_selection(self):
        return sorted(list(self.__selection))

    def get_examples(self):
        return list(self.__examples)

    def get_scores(self):
        return {prop: self.__prop_clfs[prop].get_score() for prop in self.__prop_clfs}

    def get_pclf(self, prop):
        return self.__prop_clfs[prop]

    def reset(self):
        self.__selection = set()
        self.__examples = []
        for prop in self.__prop_clfs:
            clf = self.__prop_clfs[prop]
            clf.reset()

class PNClassifier:
    def __init__(self, data, tree=None):
        self.__pselection = set()
        self.__nselection = set()

        self.__examples = []
        self.__positives = []
        self.__negatives = []
        
        if tree is None:
            self.__tree = ClusterTree(data)
        else:
            self.__tree = tree
        self.__pclusters = None
        self.__nclusters = None
        
        self.__weights = [-1.0, 1.0, 0.667]
        self.__score = None

    '''
    ACCESSORS
    '''
    def get_tree(self):
        # TODO: should be copied
        return self.__tree

    def get_pselection(self):
        return list(self.__pselection)

    def get_nselection(self):
        return list(self.__nselection)

    def get_pclusters(self):
        return list(self.__pclusters)

    def get_nclusters(self):
        return list(self.__nclusters)

    def get_examples(self):
        return list(self.__examples)

    def set_weights(self, weights):
        self.__weights = list(weights)

    def get_pscore(self):
        return self.__pscore

    def get_nscore(self):
        return self.__nscore

    '''
    ACT
    '''
    def add_example(self, example):
        self.__examples.append(example)
        if example[1] > 0:
            self.__positives.append(example[0])
        else:
            self.__negatives.append(example[0])
        self.__recluster()
        self.__reselect()

    def pop_example(self):
        last = self.__examples.pop()
        if last[1] > 0:
            self.__positives.pop()
        else:
            self.__negatives.pop()
        self.__recluster()
        self.__reselect()

    def reset(self):
        self.__pselection = set()
        self.__nselection = set()

        self.__examples = []
        self.__positives = []
        self.__negatives  = []

        self.__pclusters = None
        self.__nclusters  = None

        self.__weights = [-1.0, 1.0, 0.667]
        self.__pscore = None
        self.__nscore = None

    def __recluster(self):
        tree = self.__tree
        self.__pclusters, pscores = self.__climb(tree, 1)
        self.__nclusters, nscores = self.__climb(tree, -1)
        self.__pscore = self.__aggregate_score(pscores, 1)
        self.__nscore = self.__aggregate_score(nscores, -1)

    def __reselect(self):
        self.__pselection = set()
        for cluster in self.__pclusters:
            self.__pselection.update(self.__tree.get_children(cluster))
        self.__nselection = set()
        for cluster in self.__nclusters:
            self.__nselection.update(self.__tree.get_children(cluster))

    def __climb(self, tree, pole):
        if pole > 0:
            return self.__pos_climb(tree)
        else:
            return self.__neg_climb(tree)

    def __pos_climb(self, tree):
        def climb_condition(cluster):
            condition = (cluster is not None \
                and cluster.ccount == cluster.ecount)
            return condition

        def merge(cluster):
            cluster.parent.collect.update(cluster.collect)
            wavg_prev = cluster.parent.max_score * (cluster.parent.ecount - cluster.ecount)
            wavg_new = cluster.max_score * cluster.ecount
            cluster.parent.max_score = (wavg_prev + wavg_new) / cluster.parent.ecount
            top.remove(cluster.parent.id)

        examples, scoref = self.__examples, self.__cluster_score

        clusters = [tree.leaves[tree.translate(example)] for example in examples]
        self.__augment_counts(tree, examples)
        # remove duplicate clusters and sort
        clusters = list(set(clusters))
        clusters.sort(key=lambda cluster: cluster.data[0])
        for cluster in clusters:
            cluster.ccount = cluster.ecount

        # climb tree and collect best clusters
        top = set()
        for cidx in range(len(clusters)):
            cluster = clusters[cidx]
            while (climb_condition(cluster)):
                # print 'climb', cluster.id
                score = self.__cluster_score(cluster)
                if score >= cluster.max_score:
                    cluster.max_score = score
                    cluster.collect = {cluster.id: score}
                if cluster.parent is not None:
                    cluster.parent.ccount += cluster.ecount
                    if cluster.parent.ccount != cluster.parent.ecount or cluster.parent.ccount == cluster.ccount:
                        cluster.parent.collect = cluster.collect
                        cluster.parent.max_score = cluster.max_score
                    else:
                        merge(cluster)
                cluster = cluster.parent
            if cluster is not None:
                top.add(cluster.id)
            else:
                top.add(tree.root.id)
        rclusters, rscores = self.__aggregate_clusters(tree, top)
        self.__clean_tree(tree, examples)
    
        return rclusters, rscores

    def __neg_climb(self, tree):
        negatives = self.__negatives
        clusters = [tree.leaves[tree.translate(negative)] for negative in negatives]
        clusters = list(set(clusters))
        clusters.sort(key=lambda cluster: cluster.data[0])
        self.__augment_counts(tree, negatives)
        blacklist = self.__create_blacklist(tree, self.__positives)
        # climb consists of going up as far as possible (until you hit a positive) 
        top = set()
        for cluster in clusters:
            while (cluster is not None and cluster not in blacklist):
                cluster = cluster.parent
            top.add(cluster.id)
        rclusters, rscores = self.__aggregate_clusters(tree, top, -1)
        self.__clean_tree(tree, negatives)
        return rclusters, rscores

    def __aggregate_clusters(self, tree, top, pole):
        if pole > 0:
            chosen = {}
            for cid in top:
                chosen.update(tree.clusters[cid].collect)
            cids = sorted(chosen.keys())
            clusters = [tree.clusters[cid] for cid in cids]
            scores = [chosen[cid] for cid in cids]
            return clusters, scores
        else:
            clusters = sorted(list(top))
            scores = [cluster.count*cluster.ecount for cluster in clusters]
            return clusters, scores

    def __aggregate_score(self, scores, pole):
        if pole > 0:
            return sum(scores) / len(scores)
        else:
            return max(scores)

    def __clean_tree(self, tree, examples):
        clusters = [tree.leaves[tree.translate(example)] for example in examples]
        traces = [tree.trace(tree.root, cluster) for cluster in clusters]
        seen = set()
        for trace in traces:
            for cluster in trace:
                if cluster.id not in seen:
                    seen.add(cluster.id)
                    del cluster.ccount; del cluster.ecount
                    del cluster.collect; del cluster.max_score

    def __augment_counts(self, tree, examples):
        traces = [tree.trace(tree.root, tree.leaves[tree.translate(example)]) for example in examples]
        counts = defaultdict(int)
        for trace in traces:
            for cluster in trace:
                counts[cluster.id] += 1
        for cid in counts:
            cluster = tree.clusters[cid]
            cluster.ecount = counts[cid]
            cluster.ccount = 0
            cluster.max_score = -9000
            cluster.collect = None
        
    def __create_blacklist(self, tree, examples):
        blacklist = set()
        for example in examples:
            cluster = tree.leaves[tree.translate(example)]
            while cluster is not None and cluster not in blacklist:
                blacklist.add(cluster.id)
                cluster = cluster.parent
        return blacklist

    def __cluster_score(self, cluster):
        weights = self.__weights
        score = (weights[0]*cluster.range + weights[1]*cluster.count) * weights[2] * cluster.ecount
        return score

class SelPNClassifier:
    def __init__(self, objects, trees=None):
        if trees is not None:
            self.__prop_clfs = {feature: PNClassifier(None, trees[feature]) for feature in trees}
            self.__features = trees.keys()
            self.__count = trees[self.__features[0]].data.shape[0]
        else:
            features = objects[0].keys()
            data_map = {feature: np.array([objects[obj][feature] for obj in range(len(objects))]) for feature in features}
            self.__prop_clfs = {feature: PNClassifier(data_map[feature]) for feature in features} 
            self.__count = len(objects)

        self.__selection = set()
        self.__pselection = set()
        self.__nselection = set()
        self.__examples = []

        self.__pthreshold = 0.3
        self.__nthreshold = 0.25

    def add_example(self, example):
        self.__examples.append(example)
        for prop in self.__prop_clfs:
            clf = self.__prop_clfs[prop]
            clf.add_example(example)
        self.__reselect()

    def pop_example(self):
        self.__examples.pop()
        for prop in self.__prop_clfs:
            clf = self.__prop_clfs[prop]
            clf.pop_example()
        self.__reselect()

    def __reselect(self):
        self.__pselection = set(range(self.__count))
        self.__nselection = set()
        for prop in self.__prop_clfs:
            clf = self.__prop_clfs[prop]
            if clf.get_pscore() >= self.__pthreshold and clf.get_nscore() >= self.__nthreshold:
                self.__pselection.intersection_update(clf.get_pselection())
                self.__nselection.union_update(clf.get_nselection())
            elif clf.get_pscore() >= self.__pthreshold and clf.__nscore < self.__nthreshold:
                self.__pselection.intersection_update(clf.get_pselection())
            elif clf.get_pscore() < self.__pthreshold and clf.get_nscore() > self.__nthreshold:
                self.__nselection.union_update(clf.get_nselection())
        self.__selection = self.__pselection.difference(self.__nselection)
        for ex in self.__examples:
            if ex[1] > 0:
                self.__selection.add(ex[0])
            else:
                self.__selection.remove(ex[0])

    def get_selection(self):
        return sorted(list(self.__selection))

    def get_examples(self):
        return list(self.__examples)

    def get_scores(self):
        scores = { \
            prop: { \
                'positive': self.__prop_clfs[prop].get_pscore(), \
                'negative': self.__prop_clfs[prop].get_nscore() \
            } \
        for prop in self.__prop_clfs} 
        return scores

    def get_pclf(self, prop):
        return self.__prop_clfs[prop]

    def get_props(self):
        return sorted(self.__prop_clfs.keys())

    def reset(self):
        self.__selection = set()
        self.__pselection = set()
        self.__nselection = set()
        self.__examples = []
        for prop in self.__prop_clfs:
            clf = self.__prop_clfs[prop]
            clf.reset()
