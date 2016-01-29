"""Server for processing selection test document requests.

This script runs a server for taking JSON objects describing requests
for test documents. On the front-end, these test documents in turn
specify how to present selection tests and what metrics to analyze
them with.

Usage:

  python TestDocServer.py [port]

Messages:

  GET:

  POST:

Tests:

  Manual:

  Semi-automated:

  Fully-automated:

Evaluations:

  Accuracy:

  Types:

  Histories:
"""

import urlparse
import urllib
import json
import os
from BaseHTTPServer import HTTPServer, BaseHTTPRequestHandler
from fuzzywuzzy import process

#IMAGE_DIR = "/home/summit/Documents/Programming/Insight/site/test"
IMAGE_DIR = "../../../test"
RESULTS_DIR = (IMAGE_DIR + "/" + "results")
IMAGE_INDEX = (IMAGE_DIR + "/" + "index.txt")
MEM_INDEX = None

class ImageIndex(object):
    '''
    Represent a mapping between images and tags in memory.

    '''

    def __init__(self, image_dir, index_file):
        '''
        Create the in-memory index by initializing its constituent parts,
        the map from files to tags, and tags to files.
        '''
        self.image_dir = image_dir
        self.index_file = index_file
        self.create_index(self.index_file)
        self.create_rev_index(self.index_file)

    def match_tags(self, tag_string):
        '''
        Take a string representing a tag-search query and provide
        provide autocomplete results for the last tag. The last tag
        is assumed to be incomplete, while the previous ones are
        assumed to be complete.

        Parameters:
            tag_string: string representing unfinished tag-query in CNF
                ex) bubbles&hotspot&cool;maybe;chocolates&bu

        Result:
            returns a list of known tags that appropriately complete
            the last unfinished tag in tag_string
        '''
        disjuncts = tag_string.split(';')
        last_conjunct = disjuncts[-1]
        last_tag = last_conjunct[-1]
        all_keys = self.rev_map.keys() + self.map.keys()
        match_res = process.extract(last_tag, all_keys, limit=5)
        match_res = [score[0] for score in match_res]
        return match_res

    def match_test_tags(self, tag_string):
        '''
        Hey.
        '''
        type_split = tag_string.split('!')
        notype_tagstring = type_split[-1]
        return self.match_tags(notype_tagstring)

    def search_tags(self, tag_string):
        '''
        Get filenames for all images satisfying query specified by
        tag_string.

        Parameters:
            tag_string: string representing complete CNF tag-query

        Result:
            returns a list of images which has any of the sets of tags
            specified by the tag_string conjunctions
        '''

        def __conjunction_match(conjunct):
            '''
            Finds images which contain all tags in a tag conjunction.
            '''
            conjunct_tags = conjunct.split('&')
            matches = []
            for tag in conjunct_tags:
                tag_set = set([])
                tag_match = self.rev_map.get(tag)
                if tag_match:
                    tag_set.update(tag_match)
                if tag in self.map:
                    tag_set.add(tag)
                matches.append(tag_set)
            conjunct_images = set.intersection(*matches)
            return conjunct_images

        conjuncts = tag_string.split(';')
        conjunct_matches = [__conjunction_match(conjunct) for conjunct in conjuncts]
        all_images = list(set.union(*conjunct_matches))
        # TODO: map all images to their JSON files
        return list(all_images)

    def search_tags_new(self, tag_string):
        '''
        Get filenames for all images satisfying query specified by
        tag_string.

        Parameters:
            tag_string: string representing complete CNF tag-query

        Result:
            returns a list of images which has any of the sets of tags
            specified by the tag_string conjunctions
        '''

        def __conjunction_match(conjunct):
            '''
            Finds images which contain all tags in a tag conjunction.
            '''
            conjunct_tags = conjunct.split('&')
            matches = []
            for tag in conjunct_tags:
                tag_set = set([])
                tag_match = self.rev_map.get(tag)
                if tag_match:
                    tag_set.update(tag_match)
                if tag in self.map:
                    tag_set.add(tag)
                matches.append(tag_set)
            conjunct_images = set.intersection(*matches)
            return conjunct_images

        conjuncts = tag_string.split(';')
        conjunct_matches = [__conjunction_match(conjunct) for conjunct in conjuncts]
        all_images = list(set.union(*conjunct_matches))
        tests = []
        for image in all_images:
            fp = open(IMAGE_DIR + "/" + image + ".test", 'r')
            tests.append(json.load(fp))
            fp.close()

        return tests

    def search_test_tags(self, tag_string):
        '''
        Fill this in.

        '''

        '''
        IDEALLY TYPE PROCESSING SHOULD BE ON BACKEND!!

        type_split = tag_string.split('!')
        types = None
        if len(type_slit) > 1:
            types = type_split[0].split('|')
        else:
            types = ['man', 'semi', 'auto'] # Consider other defaults
        '''

        images = self.search_tags(tag_string)
        # get test file for each image
        tests = []
        for image in images:
            test_fname = (self.image_dir + '/' + image + '.test')
            test_file = open(test_fname, 'r')
            contents = test_file.readlines()
            contents = [line.rstrip() for line in contents]
            test_file.close()
            tests_json = [json.loads(content) for content in contents]
            for ind in range(len(tests_json)):
                tests_json[ind]["index"] = ind
            tests.extend(tests_json)
        return tests

    def create_index(self, fname):
        '''
        Builds the mapping from images to tags in-memory.

        Parameters:
            fname: the name of the file to build the index from

        Result:
            the index file is set, the mapping created and stored

        '''
        self.index_file = fname
        self.map = {}
        with open(self.index_file, 'r') as file_obj:
            lines = file_obj.readlines()
            for line in lines:
                img_tag_split = line.split('|')
                img_tag_split = [img_tag_split[i].strip() for i in range(len(img_tag_split))]
                self.map[img_tag_split[0]] = set(img_tag_split[1].split(';'))

    def create_rev_index(self, fname):
        '''
        Builds the mapping from tags to images in-memory.

        Parameters:
            fname: the name of the file to build the mapping from
                NOTE: should only be called with curent index file

        '''
        if self.index_file != fname:
            self.index_file = fname
            self.create_index(self.index_file)

        self.rev_map = {}
        for img in self.map.keys():
            tags = self.map[img]
            for tag in tags:
                if tag in self.rev_map:
                    self.rev_map[tag].add(img)
                else:
                    self.rev_map[tag] = set([img])

    def get_image(self, fname):
        '''
        Gets the full SVG string for the image file specified.

        Parameters:
            fname: the identifier specifying the image file
                NOTE: flat name, since currently no directory structure

        '''
        fullpath = self.image_dir + "/" + fname + ".svg"
        svg_string = ""
        with open(fullpath, 'r') as img_file:
            svg_string = img_file.read()
        return svg_string

def convert_results_for_semantic(results):
    '''
    Take list of string results and convert them to semantic search readable
    results.
    '''
    semantic_results = [{"title": results[i]} for i in range(len(results))]
    return semantic_results

class TestDocHandler(BaseHTTPRequestHandler):
    """
    Handle requests for Insight images and test files.
    """

    def do_OPTIONS(self):
        """
        Handle OPTIONS requests for the server.
        """
        self.__send_headers()

    def do_GET(self):
        """
        Handle GET requests for Insight images and test files.

        Messages:
            tags:   request possible tag or filename matches for a tagstring
            search: request images matching a tagstring (CNF)
            image:  request full SVG string for an image file
        """
        # get JSON request from URL, read message type
        post_data = urllib.unquote(urlparse.urlparse(self.path).query)
        print "Pre post-data: {0}".format(post_data)
        data = json.loads(post_data)
        message = data['message']

        # send headers for cross-origin, json response type
        self.__send_headers()
        # end headers with blank line
        self.wfile.write("\n")

        if message == "tags":
            ac_tags = MEM_INDEX.match_tags(data['tagstring'])
            ac_tags = convert_results_for_semantic(ac_tags)
            # write json data to response
            json.dump({"results": ac_tags}, self.wfile)
        elif message == "test_tags":
            ac_tags = MEM_INDEX.match_test_tags(data['tagstring'])
            ac_tags = convert_results_for_semantic(ac_tags)
            json.dump({"results": ac_tags}, self.wfile)
        elif message == "search":
            search_results = MEM_INDEX.search_tags(data['tagstring'])
            # write json data to response
            json.dump({"result": search_results}, self.wfile)
        elif message == "search_new":
            search_results = MEM_INDEX.search_tags_new(data['tagstring'])
            print "send data: {0}".format(search_results)
            json.dump({"result": search_results}, self.wfile)
        elif message == "test_search":
            search_results = MEM_INDEX.search_test_tags(data['tagstring'])
            json.dump({"result": search_results}, self.wfile)
        elif message == "image":
            image = MEM_INDEX.get_image(data['name'])
            json.dump({"result": image}, self.wfile)

    def do_POST(self):
        """
        Handle POST requests for Insight images and test files.

        Messages:
            tags:   request possible tag or filename matches for a tagstring
            search: request images matching a tagstring (CNF)
            image:  request full SVG string for an image file

        """
        length = int(self.headers.get('content-length'))
        pre_data = self.rfile.read(length)
        data = json.loads(pre_data)
        message = data['message']
        if message == "tests":
            self.__send_headers()
            tests = data['tests']
            for test in tests:
                image = test['image']
                test_fname = IMAGE_DIR + '/' + image + '.test'
                test_file = open(test_fname, 'a')
                test_file.write(json.dumps(test))
                test_file.close()
        if message == "results":
            self.__send_headers()
            results = data['results']
            res_fname = RESULTS_DIR + "/results" + str(len(os.listdir(RESULTS_DIR))) + ".result"
            res_file = open(res_fname, 'w')
            for result in results:
                res_file.write(json.dumps(result) + '\n')
            res_file.close()

    def __send_headers(self):
        """
        Send headers allowing for cross origin requests.
        """
        self.send_response(200, "ok")
        self.send_header('Access-Control-Allow-Credentials', 'true')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', """X-Requested-With,
                Content-type, Content-length""")


if __name__ == '__main__':
    MEM_INDEX = ImageIndex(IMAGE_DIR, IMAGE_INDEX)
    HTTPD = HTTPServer(('localhost', 8080), TestDocHandler).serve_forever()
