import httplib2

from apiclient import discovery
from apiclient import errors
from oauth2client import client

from flask import Flask, jsonify, request
import flask
import os
import os.path
import codecs

app = Flask(__name__, static_url_path="")
app.secret_key = os.urandom(24)


@app.route("/")
def home():
    secrets = "./data/tokens.json"
    if not os.path.isfile(secrets):
        return flask.redirect(flask.url_for("oauth2callback"))

    return app.send_static_file("myTunes.html")


@app.route("/itemUrl")
def getItemUrl():
    secrets = "./data/tokens.json"
    if not os.path.isfile(secrets):
        return "Unauthorized!"
    if "id" not in request.args:
        return "Need item ID!"
    itemId = request.args["id"]
    with codecs.open(secrets, "r", encoding="utf-8") as f:
        credentials = client.OAuth2Credentials.from_json(f.read())
    if credentials.access_token_expired:
        credentials.refresh(httplib2.Http())
    http_auth = credentials.authorize(httplib2.Http())
    drive = discovery.build("drive", "v2", http_auth)

    try:
        file = drive.files().get(fileId=itemId).execute()
        itemUrl = file["downloadUrl"] + "&access_token=" + credentials.access_token
        return jsonify(itemUrl)
    except(errors.HttpError, error):
        print("Error: %s" % error)


@app.route("/oauth2callback")
def oauth2callback():
    secrets = "./data/tokens.json"
    flow = client.flow_from_clientsecrets(
        "./data/config.json",
        scope="https://www.googleapis.com/auth/drive.readonly",
        redirect_uri=flask.url_for("oauth2callback", _external=True))
    flow.params["access_type"] = "offline"
    flow.params["prompt"] = "consent"
    if "code" not in flask.request.args:
        auth_uri = flow.step1_get_authorize_url()
        return flask.redirect(auth_uri)
    else:
        auth_code = flask.request.args.get("code")
        credentials = flow.step2_exchange(auth_code)
        with codecs.open(secrets, "w", encoding="utf-8") as f:
            f.write(credentials.to_json())
        return flask.redirect(flask.url_for("home"))


if __name__ == "__main__":
    app.run()