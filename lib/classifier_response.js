function Response(classifier){
  this.raw_response = "";
}

Response.prototype.data = function(some_data) {
  this.raw_response += some_data;
};

Response.prototype.complete = function(){
  this.response_data = JSON.parse(this.raw_response);
}

Response.prototype.results = function(){
  return this.response_data;
}

module.exports = Response;
