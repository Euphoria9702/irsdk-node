'use strict';

var request = require('superagent');
var Q = require('q');
Q.longStackSupport = true;

var auth = require('./auth');

function farmerClient(host, appKey, appSecret) {

    function signParams(params) {
        params = params || {};
        return auth.signParams(params,
            new Date().toISOString(),
            appKey,
            appSecret);
    }

    function errorJson(json) {
        return new Error(JSON.stringify(json, null, 2));
    }

    function done(resolve, reject) {
        return function(err, res) {
            if (err) {
                reject(err);
            } else {
                var body = res.body;
                if (body.statusCode != 0) reject(errorJson(body));
                else resolve(body);
            }
        }
    }

    function ping() {
        return Q.promise(function(resolve, reject) {
            request.get(host + '/ping')
            .end(done(resolve, reject));
        });
    }

    function getTargets() {
        return Q.promise(function(resolve, reject) {
            request.get(host + '/targets/')
            .query(signParams())
            .end(done(resolve, reject));
        });
    }

    function createTarget(target) {
        return Q.promise(function(resolve, reject) {
            request.post(host + '/targets/')
            .send(signParams(target))
            .end(done(resolve, reject));
        });
    }

    function getTarget(targetId) {
        return Q.promise(function(resolve, reject) {
            request.get(host + '/target/' + targetId)
            .query(signParams())
            .end(done(resolve, reject));
        });
    }

    function updateTarget(targetId, data) {
        return Q.promise(function(resolve, reject) {
            request.put(host + '/target/' + targetId)
            .send(signParams(data))
            .end(done(resolve, reject));
        });
    }

    function deleteTarget(targetId) {
        return Q.promise(function(resolve, reject) {
            request.del(host + '/target/' + targetId)
            .query(signParams())
            .end(done(resolve, reject));
        });
    }

    return {
        ping: ping,
        getTargets: getTargets,
        createTarget: createTarget,
        getTarget: getTarget,
        updateTarget: updateTarget,
        deleteTarget: deleteTarget
    };

};

module.exports = farmerClient;