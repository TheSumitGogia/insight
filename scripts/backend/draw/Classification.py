import numpy as np
from sklearn import preprocessing, svm

class RBFSVMClassifier():

    def set_data(self, all_features, rev_index):
        self.data = all_features
        self.rev_index = rev_index
        self.fwd_index = {obj: ind for ind, obj in rev_index.iteritems()}
        self.labels = {obj: -1 for obj in self.fwd_index.keys()}
        self.examples = ([], [])
        self.clf = svm.SVC()

    def update(self, object_id, polarity):
        # add example
        self.examples[0].append(object_id)
        self.examples[1].append(polarity)

        if (-1 not in self.examples[1] or 1 not in self.examples[1]):
            self.labels[object_id] = polarity
            return

        # fit svm with examples
        ex_data = self.data[[self.fwd_index[obj] for obj in self.examples[0]]]
        ex_labels = np.array(self.examples[1]).reshape(len(self.examples[1]))
        self.clf.fit(ex_data, ex_labels)

        # predict new labels and update status
        new_labels = self.clf.predict(self.data)
        for i in range(self.data.shape[0]):
            object_id = self.rev_index[i]
            self.labels[object_id] = new_labels[i]

    def status(self):
        return self.labels

    def reset(self):
        try:
            self.labels = {obj: -1 for obj in self.fwd_index.keys()}
            self.examples = ([], [])
            self.clf = svm.SVC()
        except AttributeError:
            print "Nothing to reset!"

class NewExtractor():
    def __init__(self):
        self.feature_counts = {
            'shape': 5,
            'strokeWidth': 1,
            'strokeColor': 3,
            'fillColor': 3,
            'position': 2,
            'scale': 2
        }

    def extract(self, all_named_features, feature_names=None):
        object_ids = all_named_features.keys()
        object_ids = sorted(object_ids)
        first_named_features = all_named_features[object_ids[0]]
        if not feature_names:
            feature_names = first_named_features.keys()
        feature_matrix = None
        rev_index = {}
        counter = 0
        for object_id in object_ids:
            named_features = all_named_features[object_id]
            single_features = self.extract_single(named_features, feature_names)
            if feature_matrix is None:
                feature_matrix = single_features
            else:
                feature_matrix = np.vstack((feature_matrix, single_features))
            rev_index[counter] = int(object_id)
            counter += 1
        feature_matrix = preprocessing.scale(feature_matrix)
        return feature_matrix, rev_index

    def extract_single(self, named_features, feature_names=None):
        if not feature_names:
            feature_names = named_features.keys()
        num_features = sum([self.feature_counts[name] for name in feature_names])
        feature_vec = np.zeros((1, num_features))
        feature_index = 0
        for name in feature_names:
            feature_val = named_features[name]
            features = None
            if name == 'shape':
                shape_arr = np.array(feature_val)
                fft_res = np.fft.rfft(shape_arr)
                features = np.abs(fft_res[0:5])
            elif name == 'strokeWidth':
                features = np.array([feature_val])
            else:
                features = np.array(feature_val)
            start_ind = feature_index
            end_ind = feature_index + features.shape[0]
            feature_vec[0, start_ind:end_ind] = features
            feature_index = end_ind
        return feature_vec

class SimpleExtractor():

    def __init__(self):
        self.feature_counts = {
            'shape': 5,
            'strokeWidth': 1,
            'strokeColor': 3,
            'fillColor': 3,
            'position': 2,
            'scale': 2
        }

    def extract(self, all_named_features, feature_names=None):
        object_ids = all_named_features.keys()
        first_named_features = all_named_features[object_ids[0]]
        if not feature_names:
            feature_names = first_named_features.keys()
        feature_matrix = None
        rev_index = {}
        counter = 0
        for object_id in object_ids:
            named_features = all_named_features[object_id]
            single_features = self.extract_single(named_features, feature_names)
            if feature_matrix is None:
                feature_matrix = single_features
            else:
                feature_matrix = np.vstack((feature_matrix, single_features))
            rev_index[counter] = int(object_id)
            counter += 1
        feature_matrix = preprocessing.scale(feature_matrix)
        return feature_matrix, rev_index

    def extract_single(self, named_features, feature_names=None):
        if not feature_names:
            feature_names = named_features.keys()
        num_features = sum([self.feature_counts[name] for name in feature_names])
        feature_vec = np.zeros((1, num_features))
        feature_index = 0
        for name in feature_names:
            feature_val = named_features[name]
            features = None
            if name == 'shape':
                shape_arr = np.array(feature_val)
                fft_res = np.fft.rfft(shape_arr)
                features = np.abs(fft_res[0:5])
            elif name == 'strokeWidth':
                features = np.array([feature_val])
            else:
                features = np.array(feature_val)
            start_ind = feature_index
            end_ind = feature_index + features.shape[0]
            feature_vec[0, start_ind:end_ind] = features
            feature_index = end_ind
        return feature_vec
