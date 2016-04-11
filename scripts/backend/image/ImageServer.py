import urlparse, urllib, json
import datetime
import os
import numpy as np
from BaseHTTPServer import HTTPServer, BaseHTTPRequestHandler

IMAGE_DIR = "../../../../test"

def read_time(time):
    dt_rep = datetime.datetime.strptime(time, '%Y-%m-%d %H:%M:%S.%f')
    return dt_rep

def get_all_images():
    dirlist = os.listdir(IMAGE_DIR)
    indices = np.random.permutation(np.arange(len(dirlist)))
    images = [dirlist[i] for i in indices] 
    images = [image[:-4] for image in images]
    return images

def ac_images(tagstring):
    images = get_all_images()
    images.append('all')
    images = [image for image in images if image.startswith(tagstring)]
    images = sorted(images)
    return images

def search(tagstring):
    images = get_all_images()
    if tagstring == 'all':
        return images
    elif tagstring in images:
        return [tagstring]

def ac_convert_to_semantic(results):
    semantic_results = [{"title": results[i]} for i in range(len(results))]
    return semantic_results

def read_image(name):
    fullpath = IMAGE_DIR + "/" + name + ".svg"
    with open(fullpath, 'r') as  img_file:
        svg_string = img_file.read()
    return svg_string

class ImageHandler(BaseHTTPRequestHandler):

    def do_OPTIONS(self):
        self.__send_headers()

    def do_GET(self):
        # get JSON request from URL, read message type
        get_data = urllib.unquote(urlparse.urlparse(self.path).query)
        data = json.loads(get_data)
        message = data['message']

        # send headers for cross-origin, json response type
        self.__send_headers()
        self.wfile.write("\n")

        # process request
        if message == "tag":
            print "**TAG REQUEST**"
            print "Request:", data
            ac_tags = ac_images(data['tagstring'])
            ac_tags = ac_convert_to_semantic(ac_tags)
            print "Response:", ac_tags
            json.dump({"results": ac_tags}, self.wfile)
        elif message == "search":
            print "**SEARCH REQUEST**"
            print "Request:", data
            search_results = search(data['tagstring'])
            print "Response:", search_results
            json.dump({"result": search_results}, self.wfile)
        elif message == "image":
            print "**IMAGE REQUEST**"
            print "Request:", data
            image = read_image(data['name'])
            json.dump({"result": image}, self.wfile)

    def do_POST(self):
        length = int(self.headers.get('content-length'))
        pre_data = self.rfile.read(length)
        data = json.loads(pre_data)
        message = data['message']

        if message == "user":
            print "**NEW USER REQUEST**"
            user_idx = get_current_user()
            self.__send_data("success")

    def __send_data(self, data):
        self.__send_headers()
        self.end_headers()
        json.dump({"result": data}, self.wfile)
        self.wfile.close()

    def __send_headers(self):
        self.send_response(200, "ok")
        self.send_header('Access-Control-Allow-Credentials', 'true')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', """X-Requested-With,
                Content-type, Content-length""")
        self.send_header('Content-Type', 'application/json')

if __name__ == '__main__':
    HTTPD = HTTPServer(('localhost', 8080), ImageHandler).serve_forever()
