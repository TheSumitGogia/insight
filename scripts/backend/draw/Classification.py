import numpy as np
from sklearn import svm

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

        positives = filter(lambda ex: ex['polarity'] == 1, self.__examples)
        if len(positives) == len(self.__examples) or len(positives) == 0:
            self.__selection = positives[:]
            return

        # fit svm with examples
        ex_data = self.__data[map(lambda ex: ex['object'], self.__examples)]
        ex_labels = np.array(map(lambda ex: ex['polarity'], self.__examples))
        self.clf.fit(ex_data, ex_labels)

        labels = self.clf.predict(self.__data)
        self.selection = filter(lambda i: labels[i] == 1, range(labels.shape[0]))

    def pop_example(self, object_id, polarity):
        self.__examples.pop()
        # NOTE: not committing to selection

    def get_selection(self):
        return self.__selection[:]

    def get_examples(self):
        return self.__examples[:]

    def reset(self):
        self.__selection = []
        self.__examples = []
        self.__clf = svm.SVC()

