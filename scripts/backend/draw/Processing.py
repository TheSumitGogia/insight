import numpy as np
from sklearn import preprocessing

class NPProcessor():
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

class DictProcessor():
    # TODO: change to all static
    def process(self, objects, strip=[]):
        all_features = map(self.process_single, objects)
        new_features = {}
        for feature in all_features[0].keys():
            arr = np.array([obj[feature] for obj in all_features])
            new_features[feature] = arr 
        self.__strip_features(new_features, strip)
        return new_features

    def __strip_features(self, features, names):
        if len(names) == 0:
            return
        nameset = set(names)
        for feature in features:
            if feature.split('_')[0] in nameset:
                del features[feature]

    def process_single(self, object_rep):
        def feature_arr_to_map(arr, name):
            res = {(name + '_' + str(i)): arr[i] for i in range(len(arr))}
            return res

        all_features = []
        for name in sorted(object_rep.keys()):
            feature_val = object_rep[name]
            if name == 'fillColor' and feature_val == False:
                print 'here we are yo', object_rep
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

