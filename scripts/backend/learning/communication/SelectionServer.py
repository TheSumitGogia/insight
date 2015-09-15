from Classification import SVMClassifier
from BaseHTTPServer import HTTPServer, BaseHTTPRequestHandler

"""Server for processing vector object generalization requests.

This script runs a server for taking JSON vector object representations
and using the examples to help cluster and model general sets of vector 
objects. Generalization from examples can be restricted to a finite set 
of vector objects (as contained in one image) or applied to an infinite 
underlying space of vector paths. The training for generalization can 
also be supervised or unsupervised.

Usage:
  
  python SelectionServer.py [port] [classifier] [extractor]

Messages:

  GET:
    full: Request model info for all vector objects.
    object: Request model info for a single vector object. 
    list: Request model info for a list of vector objects.
    features: Request string rep of feature extraction model.
    classifier: Request string rep of classifier model.

  POST:
    full: Inform learner of vector path data for all objects.
    update: Inform learner of new example object data.
    commit: Indicate that the previous example will stay.
    discard: Indicate that the previous example will be discarded.
    set_learner: Specify learning module for generalization, and 

Classifiers:

  RBFSVMClassifier
  PolySVMClassifier
  DPGMMClassifier
  LassoClassifier

Extractors:
  
  SimpleExtractor
  PolyExtractor

"""

class SelectionHandler(BaseHTTPRequestHandler):
  """Handles HTTP requests for the selection server.

  This HTTP request handler processes GET requests for obtaining model
  views of vector path data, as well as POST requests for passing 
  vector path data to the learning modules, and thus the generalized
  models.

  """

  def do_GET(self):
    """Method for processing path model requests in JSON form.

    This method parses the currently handled message, and returns the
    information on the backend about models the vector paths requested.

    JSON Format:
      {"message": message, [params...]}

    Messages:
      full: Request model info for all vector objects.
        
        params:
          labels (boolean): Request class labels.      
          features (boolean): Request feature vectors.
      
      object: Request model info for a single vector object. 
        
        params:
          id (int): Permanent reference ID of vector object. 
          labels (boolean): Request class label.
          features (boolean): Request feature vector.
      
      list: Request model info for a list of vector objects.
        
        params:
          ids (int array): Permanent reference IDs for vector objects.
          labels (boolean): Request class labels.
          features (boolean): Request feature vectors.
      
      features: Request string rep of feature extraction model.
      
      classifier: Request string rep of classifier model.

    """
    pass

  def do_POST(self):
    """Method for inputting data from JSON for learning module.

    This method parses the currently handled JSON request object,
    obtaining different sets of vector objects and passing them to
    specified learning modules.

    JSON Format:
      {"message": message, [params...]}

    Messages:
      full: Inform learner of vector path data for all objects.
        
        params:
          objects: JSON object with IDs mapped to pre-features.
      
      update: Inform learner of new example object data.

        params:
          id: ID of example object.
          label (supervised): Class label for example object.
      
      commit: Indicate that the previous example will stay.
      
      discard: Indicate that the previous example will be discarded.
      
      set_learner: Specify learning module for generalization, and 
        feature extraction to use.

        params:
          classifier: One of the classification modules specified at 
            the script top.
          extractor: One of the extraction modules specified at the
            script top.
    """
    pass

if __name__ == '__main__':
  pass
