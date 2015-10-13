import urlparse
import urllib
import json
from BaseHTTPServer import HTTPServer, BaseHTTPRequestHandler
from fuzzywuzzy import process

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

IMAGE_DIR = "/home/summit/Documents/insight/test"
IMAGE_INDEX = (IMAGE_DIR + "/" + "tag_index.txt")
MEM_INDEX = None

class ImageIndex():
    '''


    '''

    def __init__(self, image_dir, index_file):
        '''
            Create the in-memory index by initializing its constituent parts,
            the map from files to tags, and tags to files.
        '''
        self.image_dir = image_dir
        self.index_file = index_file
        self.map = self.create_index(self.index_file)
        self.rev_map = self.create_rev_index(self.index_file)

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
        match_res = process.extract(last_tag, all_keys, limit=10)
        match_res = [score[0] for score in match_res]
        return match_res

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

        def conjunction_match(conjunct):
            '''
                Finds images which contain all tags in a tag conjunction.
            '''
            conjunct_tags = conjunct.split('&')
            matches = []
            for tag in conjunct_tags:
                tag_set = set([])
                tag_match = self.rev_map.get(tag)
                if tag_match:
                    tag_set = tag_set.update(tag_match)
                if tag in self.map:
                    tag_set.add(tag)
                matches.append(tag_set)
            conjunct_images = set.intersection(*matches)
            return conjunct_images

        conjuncts = tag_string.split(';')
        conjunct_matches = [conjunction_match(conjunct) for conjunct in conjuncts]
        all_images = set.union(*conjunct_matches)
        return list(all_images)

    def create_index(self, fname):
        '''
            Builds the mapping from images to tags in-memory.

            Parameters:
                fname: the name of the file to build the index from

            Result:
                the index file is set, the mapping created and stored

        '''
        self.index_file = fname
        self.index = {}
        with open(self.index_file, 'r') as file_obj:
            lines = file_obj.readlines()
            for line in lines:
                img_tag_split = line.split('|')
                img_tag_split = [img_tag_split[i].strip() for i in range(len(img_tag_split))]
                self.index[img_tag_split[0]] = img_tag_split[1].split(';')

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

        self.rev_index = {}
        for img in self.index.keys():
            tags = self.index[img]
            for tag in tags:
                if tag in self.rev_index:
                    self.rev_index[tag].append(img)
                else:
                    self.rev_index[tag] = [img]

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

class TestDocHandler(BaseHTTPRequestHandler):
    """

    """

    def do_OPTIONS(self):
        self.send_response(200, "ok")
        self.send_header('Access-Control-Allow-Credentials', 'true')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', """X-Requested-With,
                Content-type, Content-length""")

    def do_GET(self):
        """

        """
        # get JSON request from URL, read message type
        post_data = urllib.unquote(urlparse.urlparse(self.path).query)
        data = json.loads(post_data)
        message = data['message']

        # send headers for cross-origin, json response type
        self.send_response(200, "ok")
        self.send_header('Access-Control-Allow-Credentials', 'true')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-type', "application/json")
        # end headers with blank line
        self.wfile.write("\n")
        if message == "tags":
            ac_tags = MEM_INDEX.match_tags(data['tagstring'])
            # write json data to response
            json.dump({"result": ac_tags}, self.wfile)
        elif message == "search":
            search_results = MEM_INDEX.search_tags(data['tagstring'])
            # write json data to response
            json.dump({"result": search_results}, self.wfile)


    def do_POST(self):
        """

        """
        length = int(self.headers.get('content-length'))
        pre_post_data = self.rfile.read(length)
        print "pre-post-data: {0}".format(pre_post_data)
        post_data = json.loads(pre_post_data)
        print "pre-data: {0}".format(post_data)
        data = json.loads(post_data['json'][0])
        print "data received: {0}".format(data)
        message = data['message']
        if message == "tags":
            self.send_response(200, "ok")
            self.send_header('Access-Control-Allow-Credentials', 'true')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-type', "application/json")
            print "params: {0}".format(data["tagstring"])
            # tag_string = data['tagString']
            # tag_split = tag_string.split(' ')
            # last_tag = tag_split[-1]
            # Get file-tag index
            # stick them all together
            # all_tags = files + tags
            # fuzzy search
            # search_res = process.extract(last_tag, all_tags, limit=7)

if __name__ == '__main__':
    httpd = HTTPServer(('localhost', 8080), TestDocHandler).serve_forever()
