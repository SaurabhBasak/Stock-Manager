import yfinance as yf
import requests
import json
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()

api_key = os.getenv("SERP_API_KEY")
print(api_key)


app = Flask(__name__)
# CORS(app, resources={r"/searchParams/*": {"origins": "https://www.google.com"}})
CORS(app, resources={r"/*": {"origins": "*"}})


@app.route("/searchParams", methods=["POST"])
def getSearchParams():
    data = request.get_json()
    params = {"api_key": api_key, "q": data["stockId"]}
    return findTicker(params)


def findTicker(params):
    # api_result = requests.get("https://api.scaleserp.com/search", params)
    # jsonData = api_result.json()
    # ticker = ""
    # for res in jsonData["organic_results"]:
    #     if res["domain"] == "finance.yahoo.com":
    #         ticker = res["displayed_link"].split(" › ")[-1]
    #         break
    # return jsonify({"ticker": ticker})
    return jsonify({"ticker": "AAPL"})


@app.route("/stock", methods=["POST"])
def get_stock_data():
    ticker = request.get_json()["ticker"]
    data = yf.Ticker(ticker).history(period="1d")
    return jsonify({"currentPrice": data.iloc[-1].Close})


if __name__ == "__main__":
    app.run(debug=True)
