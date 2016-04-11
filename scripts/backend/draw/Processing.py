import numpy as np
from sklearn import preprocessing
from structs import ClusterTree, NClusterTree

class NPProcessor:
    # TODO: change to all static
    def process(self, objects, strip=[]):
        all_features = map(lambda x: self.process_single(x, strip), objects)
        feature_matrix = np.array(all_features)
        feature_matrix = preprocessing.scale(feature_matrix)
        return feature_matrix

    def process_single(self, object_rep, strip=[]):
        all_features = []
        nameset = set(strip)
        for name in sorted(object_rep.keys()):
            if name in nameset:
                continue
            feature_val = object_rep[name]
            if name == 'shape':
                proc_features = self.__process_shape(feature_val) 
            elif name == 'strokeWidth':
                proc_features = self.__process_stroke_width(feature_val)
            else:
                proc_features = self.__process_general(feature_val)
            all_features.append(proc_features)
        feature_vec = np.hstack(all_features)
        return feature_vec

    def __process_shape(self, shape_features):
        translated = np.array(shape_features)
        fft_translated = np.fft.rfft(translated)
        processed = np.abs(fft_translated[0:5])
        return processed

    def __process_stroke_width(self, stroke_width_features):
        processed = np.array([stroke_width_features])
        return processed

    def __process_general(self, features):
        processed = np.array(features)
        return processed

class DictProcessor:
    # TODO: change to all static
    def process(self, objects, strip=[], group=[]):
        all_features = map(self.process_single, objects)
        new_features = {}
        for feature in all_features[0].keys():
            arr = np.array([obj[feature] for obj in all_features])
            new_features[feature] = arr.reshape(arr.shape[0], 1)
        self.__strip_features(new_features, strip)
        self.__group_features(new_features, group)
        return new_features

    def __group_features(self, features, names):
        if len(names) == 0:
            return
        nameset = set(names)
        groups = {}
        keys = features.keys()
        for feature in keys:
            prop = feature.split('_')[0]
            if prop in nameset:
                if prop not in groups:
                    groups[prop] = features[feature].copy()
                else:
                    groups[prop] = np.hstack((groups[prop], features[feature]))
                del features[feature] 
        features.update(groups)

    def __strip_features(self, features, names):
        if len(names) == 0:
            return
        nameset = set(names)
        keys = features.keys()
        for feature in keys:
            if feature.split('_')[0] in nameset:
                del features[feature]

    def process_single(self, object_rep):
        def feature_arr_to_map(arr, name):
            res = {(name + '_' + str(i)): arr[i] for i in range(len(arr))}
            return res

        all_features = []
        for name in sorted(object_rep.keys()):
            feature_val = object_rep[name]
            if name == 'shape':
                proc_features = self.__process_shape(feature_val) 
            elif name == 'strokeWidth':
                proc_features = self.__process_stroke_width(feature_val)
            else:
                proc_features = feature_val
            proc_features = feature_arr_to_map(proc_features, name)
            all_features.append(proc_features)
        processed = dict(i for dct in all_features for i in dct.items())
        return processed

    def __process_shape(self, shape_features):
        translated = np.array(shape_features)
        fft_translated = np.fft.rfft(translated)
        processed = np.abs(fft_translated[0:5]).tolist()
        return processed

    def __process_stroke_width(self, stroke_width_features):
        return [stroke_width_features]

class TreeCreator:
    # TODO: change to all static
    def process(self, features):
        trees = {} 
        for feature in features:
            data = features[feature]
            trees[feature] = NClusterTree(data)
        return trees

class TreeBinarizer:
    # TODO: change all to static
    numlevels = 4 
    def process(self, trees):
        feature_mat = self.__create_mat(trees)
        feature_idx = 0
        for feature in trees:
            tree = trees[feature]
            top_clusts = tree.get_top(self.numlevels)
            top_ch = map(lambda c: list(tree.get_children(c)), top_clusts)
            for idx in range(len(top_ch)):
                children = top_ch[idx]
                feature_mat[children, feature_idx+idx] = 1
            feature_idx += (2**numlevels - 1)
        return feature_mat

    def __create_mat(self, trees):
        num_data = trees[trees.keys()[0]].get_data().shape[0]
        num_features = len(features) * (2**self.num_levels - 1)
        return np.zeros((num_data, num_features))
