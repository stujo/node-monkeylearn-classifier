function Response(classifier) {
    this.raw_response = "";
    this.status_code = this.UNRESOLVED;
}

Response.prototype.UNRESOLVED = 1;
Response.prototype.RESOLVED = 2;
Response.prototype.REJECTED = 3;

Response.prototype.data = function(some_data) {
    this.raw_response += some_data;
};

Response.prototype.complete = function() {
    try {
        this.response_data = JSON.parse(this.raw_response);

        if (this.response_data.status_code >= 400) {
            throw {
                message: JSON.stringify(this.response_data.detail),
                error: this.response_data.status_code
            };
        } else {
            this.status_code = this.RESOLVED;
        }

    } catch (err) {
        this.status_code = this.REJECTED;
        this.error_thrown = err;
        return err;
    }
}

Response.prototype.error = function() {
    return this.error_thrown;
}

Response.prototype.unresolved = function() {
    return !this.resolved() && !this.rejected();
}

Response.prototype.resolved = function() {
    return this.status_code == this.RESOLVED;
}

Response.prototype.rejected = function() {
    return this.status_code == this.REJECTED;
}

Response.prototype.results = function() {
    if (this.response_data && this.response_data.result) {
        return this.response_data.result;
    }
    return {};
}

module.exports = Response;
