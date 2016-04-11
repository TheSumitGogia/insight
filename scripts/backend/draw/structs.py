import numpy as np
from sklearn.cluster import AgglomerativeClustering as hcluster
import matplotlib.pyplot as plt
from matplotlib.patches import Ellipse
from collections import deque
import argparse
from scipy.spatial.distance import pdist

def draw(datas, names):
    plt.ion()
    figure, axes = plt.subplots(1, len(datas), sharey=True)
    if len(datas) == 1: axes = [axes]

    def draw_ellipse(axes, max_level, cluster):
        max_level = max_level
        x = 0.5 * (cluster.data[0] + cluster.data[1])
        rng = cluster.data[1] - cluster.data[0]
        if max_level > 1:
            y = .25 + (cluster.level - 1) * 1.5 / (max_level - 1) 
            height = 1.5 / (max_level - 1)
        else: 
            y = 1
            height = .75
        ell = Ellipse(xy=[x,y], width=rng, height=height, angle=0)
        axes.add_artist(ell)
        ell.set_clip_box(axes.bbox)
        ell.set_alpha(0.5)
        ell.set_facecolor([0, 0, 1.0])
        return ell

    for i in range(len(datas)):
        tree = ClusterTree(datas[i])
        clusters = tree.clusters
        max_level = tree.max_level
        ax = axes[i]
        ax.set_title(names[i])
        offset, length = [1], [2.0]
        rng = np.max(datas[i]) - np.min(datas[i])
        ax.hlines(0.1, 0, rng)
        ax.set_xlim([0, rng])
        ax.set_ylim([0, 2.0])

        ax.eventplot(datas[i].copy(), lineoffsets=offset, linelengths=length, orientation='horizontal', colors='b')
        ax.get_yaxis().set_visible(False)

        for cid in clusters:
            cluster = clusters[cid]
            ellipse = draw_ellipse(ax, max_level, cluster)
    plt.draw()

def draw_tree(tree, prop):
    plt.ion()
    figure, axes = plt.subplots()
    axes = [axes]
    trees = [tree]

    def draw_ellipse(axes, max_level, cluster):
        max_level = max_level
        x = 0.5 * (cluster.data[0] + cluster.data[1])
        rng = cluster.data[1] - cluster.data[0]
        if max_level > 1:
            y = .25 + (cluster.level - 1) * 1.5 / (max_level - 1) 
            height = 1.5 / (max_level - 1)
        else: 
            y = 1
            height = .75
        ell = Ellipse(xy=[x,y], width=rng, height=height, angle=0)
        axes.add_artist(ell)
        ell.set_clip_box(axes.bbox)
        ell.set_alpha(0.5)
        ell.set_facecolor([0, 0, 1.0])
        return ell

    for i in range(len(trees)):
        tree = trees[i]
        data = tree.get_data()
        clusters = tree.clusters
        max_level = tree.max_level
        ax = axes[i]
        ax.set_title(prop)
        offset, length = [1], [2.0]
        rng = np.max(data) - np.min(data) 
        ax.hlines(0.1, 0, rng)
        ax.set_xlim([0, rng])
        ax.set_ylim([0, 2.0])

        ax.eventplot(data.copy(), lineoffsets=offset, linelengths=length, orientation='horizontal', colors='b')
        ax.get_yaxis().set_visible(False)

        for cid in clusters:
            cluster = clusters[cid]
            ellipse = draw_ellipse(ax, max_level, cluster)
    plt.draw()


class Cluster:
    def __init__(self, id, left, right, parent=None, data=None, range=None, count=None):
        self.id = id
        self.left = left
        self.right = right
        self.data = data
        self.range = range
        self.count = count
        self.parent = parent
        self.items = None

class ClusterTree:

    def __init__(self, data):
        # NOTE: assumes data is 1-d numpy array
        pos = data.argsort() 
        data = data[pos]
        data = data.reshape(data.shape[0], 1) 
        drange = data[-1,0] - data[0,0]
        dcount = data.shape[0]

        # run clustering
        # clusterer = hcluster(compute_full_tree=True)
        clusterer = hcluster(compute_full_tree=True, linkage='complete')
        clusterer.fit(data)
        hc_children = clusterer.children_

        # setup leaf clusters
        clusters = {i: Cluster(i, None, None, data=(data[i, 0], data[i, 0]), count=1, range=0) for i in range(data.shape[0])}
        leaves = {}

        # setup tree
        if drange != 0:
            minrange = 1
            for idx in range(hc_children.shape[0]):
                children = hc_children[idx]
                lc, rc = clusters[children[0]], clusters[children[1]]
                check = 0 if lc.data[-1] < rc.data[0] else 1
                left_child, right_child = clusters[children[check]], clusters[children[1-check]]
                id = idx + data.shape[0]
                cluster = Cluster(id, left_child, right_child)
                cluster.data = (min(left_child.data), max(right_child.data))
                cluster.range = (cluster.data[-1] - cluster.data[0]) / (drange)
                if cluster.range < minrange: minrange = cluster.range
                cluster.count = left_child.count + right_child.count
                left_child.parent = cluster
                right_child.parent = cluster
                clusters[id] = cluster
            
            for id in clusters:
                cluster = clusters[id]
                leaf = (cluster.count == 1)
                while (cluster.parent is not None and cluster.parent.range == 0):
                    cluster = cluster.parent
                clusters[id] = cluster
                if cluster.range == 0 and cluster.parent is not None and cluster.parent.range != 0:
                    if cluster.items is None:
                        cluster.items = set()
                    if leaf:
                        leaves[id] = cluster
                        cluster.items.add(id)

            cids = clusters.keys()
            for id in cids:
                cluster = clusters[id]
                if cluster.id != id:
                    del clusters[id]
                elif cluster.range == 0:
                    cluster.left, cluster.right = None, None

            for id in clusters:
                cluster = clusters[id]
                if cluster.range == 0:
                    if minrange < 0.1:
                        cluster.range = minrange
                    else:
                        cluster.range = 1e-4
                cluster.count = cluster.count * 1.0 / dcount
        else:
            big_cluster = Cluster(data.shape[0], None, None, data=(data[0,0], data[0,0]), count=data.shape[0], range=1e-4)
            big_cluster.items = set(range(data.shape[0]))
            for i in range(data.shape[0]):
                leaves[i] = big_cluster
            clusters = {data.shape[0]: big_cluster}

        # setup leaf levels
        for lid in leaves:
            lcluster = leaves[lid]
            lcluster.level = 1

        # compute all tree levels
        computed = set([leaves[lid].id for lid in leaves.keys()])
        for lid in leaves:
            cluster = leaves[lid]
            while (cluster is not None and \
                ((cluster.data[0] == cluster.data[1]) or \
                (cluster.right.id in computed and cluster.left.id in computed))):
                if (cluster.id not in computed):
                    cluster.level = max(cluster.right.level, cluster.left.level) + 1
                    computed.add(cluster.id)
                cluster = cluster.parent
        del computed

        # set tree state variables
        biggest, max_level = 0, 0
        for id in clusters:
            if id > biggest: biggest = id
            if clusters[id].level > max_level: max_level = clusters[id].level
        self.data = data 
        self.root = clusters[biggest]
        self.max_level = max_level
        self.clusters = clusters
        self.leaves = leaves
        self.__dindex = pos 
        self.__findex = np.argsort(pos)
        self.__drange = drange
        self.__dcount = dcount
            
    def translate(self, id):
        return self.__findex[id]

    def get_leaf(self, id):
        return self.clusters[id]

    def get_data(self):
        return self.data.copy()

    def get_top(self, numLevels):
        clusters = []
        toAdd = deque([self.root])
        while len(toAdd) > 0:
            cluster = queue.popleft()
            if cluster.level > self.max_level - numLevels:
                clusters.append(cluster)
                toAdd.append(cluster.left)
                toAdd.append(cluster.right)
        return reversed(clusters)

    def get_children(self, cluster):
        """ O(n) operation for getting items in cluster """
        queue = deque([cluster])
        children = set() 
        while len(queue) > 0:
            cluster = queue.popleft()
            if cluster.left is None and cluster.right is None:
                children.update(cluster.items) 
                continue
            if cluster.left is not None:
                queue.append(cluster.left)
            if cluster.right is not None:
                queue.append(cluster.right)
        interim = np.array(list(children))
        children = set(self.__dindex[interim].tolist())
        return children

    def trace(self, ancestor, child):
        cluster = child
        trace = []
        while cluster is not None:
            trace.append(cluster)
            if ancestor == cluster:
                return trace 
            cluster = cluster.parent
        return False

    def contains(self, container, cluster):
        current = cluster
        while current is not None:
            if container == current:
                return True
            current = current.parent
        return False

class NCluster:
    def __init__(self, id, left, right, data=None, parent=None, range=None, count=None):
        self.id = id
        self.left = left
        self.right = right
        self.data = data    # data indices, NOTE: a bit memory intensive
        self.range = range
        self.count = count
        self.parent = parent

class NClusterTree:
    
    def __diameter(self, data):
        distances = pdist(data, 'euclidean')
        if distances.shape[0] == 0:
            return 0
        else:
            diameter = np.max(distances)
            return diameter

    def __compute_distances(self, data):
        distances = pdist(data, 'euclidean')
        self.__distances = distances

    def __init__(self, data):
        drange = self.__diameter(data)
        dcount = data.shape[0]

        # run clustering
        clusterer = hcluster(compute_full_tree=True)
        clusterer.fit(data.copy())
        hc_children = clusterer.children_

        # setup leaf clusters
        clusters = {i: Cluster(i, None, None, data=np.array([data[i, :]]), count=1, range=0) for i in range(data.shape[0])}
        leaves = {}

        # setup tree
        if drange != 0:
            minrange = 1
            for idx in range(hc_children.shape[0]):
                children = hc_children[idx]
                left_child, right_child = clusters[children[0]], clusters[children[1]]
                id = idx + data.shape[0]
                cluster = Cluster(id, left_child, right_child)
                cluster.data = np.vstack((left_child.data, right_child.data))
                cluster.range = self.__diameter(cluster.data) / (drange)
                if cluster.range < minrange: minrange = cluster.range
                cluster.count = left_child.count + right_child.count
                left_child.parent = cluster
                right_child.parent = cluster
                clusters[id] = cluster
            
            for id in clusters:
                cluster = clusters[id]
                leaf = (cluster.count == 1)
                while (cluster.parent is not None and cluster.parent.range == 0):
                    cluster = cluster.parent
                clusters[id] = cluster
                if cluster.range == 0 and cluster.parent is not None and cluster.parent.range != 0:
                    if cluster.items is None:
                        cluster.items = set()
                    if leaf:
                        leaves[id] = cluster
                        cluster.items.add(id)

            # clear "clusters" from original leaves
            # set true leaves children to empty
            cids = clusters.keys()
            for id in cids:
                cluster = clusters[id]
                if cluster.id != id:
                    del clusters[id]
                elif cluster.range == 0:
                    cluster.left, cluster.right = None, None

            for id in clusters:
                cluster = clusters[id]
                if cluster.range == 0:
                    if minrange < 0.1:
                        cluster.range = minrange
                    else:
                        cluster.range = 1e-4
                cluster.count = cluster.count * 1.0 / dcount
        else:
            big_cluster = Cluster(data.shape[0], None, None, data=np.array(data[0, :]), count=data.shape[0], range=1e-4)
            big_cluster.items = set(range(data.shape[0]))
            for i in range(data.shape[0]):
                leaves[i] = big_cluster
            clusters = {data.shape[0]: big_cluster}

        # setup leaf levels
        for lid in leaves:
            lcluster = leaves[lid]
            lcluster.level = 1

        # compute all tree levels
        computed = set([leaves[lid].id for lid in leaves.keys()])
        for lid in leaves:
            cluster = leaves[lid]
            while (cluster is not None and (cluster.right is None or cluster.right.id in computed) and (cluster.left is None or cluster.left.id in computed)):
                if (cluster.id not in computed):
                    cluster.level = max(cluster.right.level, cluster.left.level) + 1
                    computed.add(cluster.id)
                cluster = cluster.parent
        del computed

        # set tree state variables
        biggest, max_level = 0, 0
        test_cl = leaves[0]
        while (test_cl.parent is not None):
            test_cl = test_cl.parent
        self.root = test_cl
        self.max_level = test_cl.level
        self.data = data
        self.clusters = clusters
        self.leaves = leaves
        self.__drange = drange
        self.__dcount = dcount
            
    def translate(self, id):
        return id

    def get_top(self, numLevels):
        clusters = []
        toAdd = deque([self.root])
        while len(toAdd) > 0:
            cluster = toAdd.popleft()
            if cluster.level > self.max_level - numLevels:
                clusters.append(cluster)
                if cluster.left is not None:
                    toAdd.append(cluster.left)
                if cluster.right is not None:
                    toAdd.append(cluster.right)
        clusters.reverse()
        return clusters

    def get_leaf(self, id):
        return self.leaves[id]

    def get_data(self):
        return self.data.copy()

    def get_children(self, cluster):
        """ O(n) operation for getting items in cluster """
        queue = deque([cluster])
        children = set() 
        while len(queue) > 0:
            cluster = queue.popleft()
            if cluster.left is None and cluster.right is None:
                children.update(cluster.items) 
                continue
            if cluster.left is not None:
                queue.append(cluster.left)
            if cluster.right is not None:
                queue.append(cluster.right)
        return children

    def trace(self, ancestor, child):
        cluster = child
        trace = []
        while cluster is not None:
            trace.append(cluster)
            if ancestor == cluster:
                return trace 
            cluster = cluster.parent
        return False

    def contains(self, container, cluster):
        current = cluster
        while current is not None:
            if container == current:
                return True
            current = current.parent
        return False

def ctree_test(clust_str, var_str, space_str, rng, num_samples):
    from data import UniformMixture as um

    def gen_data(clust_str, var_str, space_str, rng, num_samples):
        size_map = {'s': 1, 'm': 3, 'l': 5}
        var_map = {'s': 1, 'm': 3, 'l': 5}
        space_map = {'s': 1, 'm': 3, 'l': 5}
        
        sizes = [[size_map[c] for c in clust] for clust in clust_str.split('-')]
        sizes = [sum(csizes) for csizes in sizes]
        spaces = [[space_map[c] for c in clust] for clust in space_str.split('-')]
        spaces = [sum(cspaces) for cspaces in spaces]
        variances = [[var_map[c] for c in clust] for clust in var_str.split('-')] 
        variances = [sum(cvars) for cvars in variances]

        total_space = sum(spaces) + sum(variances)
        total_size = sum(sizes)
        ranges, probs = [], []
        tspace = 0
        for i in range(len(variances)):
            space, var, size = spaces[i], variances[i], sizes[i]
            tspace += space
            start = (tspace * 1.0 / total_space) * rng
            end = start + var * 1.0 / total_space * rng
            slot = (start, end)
            tspace += var
            prob = size * 1.0 / total_size
            ranges.append(slot); probs.append(prob)

        dist = um(ranges, probs)
        data = dist.sample(num_samples) 
        return data
    
    def draw_ellipse(axes, cluster):
        x = 0.5 * (cluster.data[0] + cluster.data[1])
        rng = cluster.data[1] - cluster.data[0]
        y = .25 + (cluster.level - 1) * 1.5 / (max_level - 1) 
        height = 1.5 / (max_level - 1)
        ell = Ellipse(xy=[x,y], width=rng, height=height, angle=0)
        axes.add_artist(ell)
        ell.set_clip_box(axes.bbox)
        ell.set_alpha(0.5)
        ell.set_facecolor([0, 0, 1.0])

    data = gen_data(clust_str, var_str, space_str, rng, num_samples)
    ct = ClusterTree(data)
    max_level, clusters = ct.max_level, ct.clusters

    fig, ax = plt.subplots()
    offset, length = [1], [2.0]
    plt.hlines(0.1, 0, rng) 
    plt.xlim([0, rng])
    plt.ylim([0, 2.0])

    ev = plt.eventplot(data, lineoffsets=offset, linelengths=length, orientation='horizontal', colors='b')
    ax.get_yaxis().set_visible(False)

    for cluster in clusters:
        draw_ellipse(ax, clusters[cluster])

    plt.show()

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Test Cluster Tree")
    parser.add_argument('-n', '--samples', nargs=1,required=True,type=int,help='number of samples')
    parser.add_argument('-r', '--range', nargs=1,required=True,type=int,help='max data value')
    parser.add_argument('-s', '--sizes', nargs=1,required=True,type=str,help='cluster size string')
    parser.add_argument('-p', '--spaces', nargs=1,required=True,type=str,help='spaces between clusters')
    parser.add_argument('-v', '--variances', nargs=1,required=True,type=str,help='spaces for clusters')

    args = vars(parser.parse_args())
    samples = args['samples'][0]
    rng = args['range'][0]
    sizes = args['sizes'][0]
    spaces = args['spaces'][0]
    variances = args['variances'][0]

    ctree_test(sizes, variances, spaces, rng, samples)
