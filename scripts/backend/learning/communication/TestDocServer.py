from Classification import SVMClassifier
from BaseHTTPServer import HTTPServer, BaseHTTPRequestHandler

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

class TestDocHandler(BaseHTTPRequestHandler):
  """

  """

  def do_GET(self):
    """

    """
    pass

  def do_POST(self):
    """

    """
    pass

if __name__ == '__main__':
  pass
