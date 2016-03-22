import urlparse, urllib
import json
from Classification import SVMClassifier#, SelectClassifier 
from Processing import NPProcessor#, DictProcessor
from BaseHTTPServer import HTTPServer, BaseHTTPRequestHandler

classifier = None
clf_type = SVMClassifier

processor = NPProcessor() 

class SelectionHandler(BaseHTTPRequestHandler):

    def do_GET(self):
        get_data = urllib.unquote(urlparse.urlparse(self.path).query)
        data = json.loads(get_data)
        message = data['message']

        if message == 'selection':
            selection = classifier.get_selection()
            self.__send_data(selection)

    def do_POST(self):
        length = int(self.headers.get('content-length'))
        pre_data = self.rfile.read(length)
        data = json.loads(pre_data)
        message = data['message']

        if message == 'data':
            self.__send_headers()
            named_features = data['features']
            features = processor.process(named_features)
            classifier = clf_type(features)
            self.__send_data("success")
        elif message == 'update':
            classifier.add_example(data['object'], data['polarity'])
            selection = classifier.get_selection()
            self.__send_data(selection)
        elif message == 'reset':
            classifier.reset()
            self.__send_data("success")

    def __send_headers(self):
        self.send_response(200, "ok")
        self.send_header('Access-Control-Allow-Credentials', 'true')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', """X-Requested-With,
                Content-type, Content-length""")
        self.send_header('Content-Type', 'application/json')

    def __send_data(self, data):
        self.__send_headers()
        self.end_headers()
        json.dump({"result": data}, self.wfile)
        self.wfile.close()


if __name__ == '__main__':
    HTTPD = HTTPServer(('localhost', 1025), SelectionHandler).serve_forever()
