import numpy as np
from sklearn import preprocessing

class NPProcessor():
    # TODO: change to all static
    def process(self, objects):
        all_features = map(self.process_single, objects)
        feature_matrix = np.array(all_features)
        feature_matrix = preprocessing.scale(feature_matrix)
        return feature_matrix

    def process_single(self, object_rep):
        all_features = []
        for name in sorted(object_rep.keys()):
            feature_val = named_features[name]
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
        processed = np.abs(fft_res[0:5])
        return processed

    def __process_stroke_width(self, stroke_width_features):
        processed = np.array([stroke_width_features])
        return processed

    def __process_general(self, features):
        processed = np.array(features)
        return processed

class DictProcessor():
    # TODO: change to all static
    def process(self, objects):
        all_features = map(self.process_single, objects)
        feature_matrix = np.array(all_features)
        return feature_matrix

    def process_single(self, object_rep):
        def feature_arr_to_map(arr, name):
            res = {(name + '_' + str(i)): arr[i] for i in range(len(arr))}
            return res

        all_features = []
        for name in sorted(object_rep.keys()):
            feature_val = named_features[name]
            if name == 'shape':
                proc_features = self.__process_shape(feature_val) 
            elif name == 'strokeWidth':
                proc_features = self.__process_stroke_width(feature_val)
            else:
                proc_features = feature_val
            proc_features = feature_arr_to_map(proc_features, name)
        processed = dict(i for dct in dicts for i in dct.items())
        return processed

    def __process_shape(self, shape_features):
        translated = np.array(shape_features)
        fft_translated = np.fft.rfft(translated)
        processed = np.abs(fft_res[0:5]).tolist()
        return processed

    def __process_stroke_width(self, stroke_width_features):
        return [stroke_width_features]
