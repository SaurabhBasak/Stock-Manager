import yfinance as yf
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import smtplib
from dotenv import load_dotenv
import requests

load_dotenv()

EMAIL_ADDRESS = os.getenv("Email_addy")
EMAIL_PASSWORD = os.getenv("Email_pass")
SEARCH_API_KEY = os.getenv("SERP_API_KEY")


app = Flask(__name__)
# CORS(app, resources={r"/searchParams/*": {"origins": "https://www.google.com"}})
CORS(app, resources={r"/*": {"origins": "*"}})


@app.route("/searchParams", methods=["POST"])
def getSearchParams():
    data = request.get_json()
    params = {"api_key": SEARCH_API_KEY, "q": data["parameters"]}
    ticker = findTicker(params)
    return ticker


def findTicker(params):
    # api_result = requests.get("https://api.scaleserp.com/search", params)
    # jsonData = api_result.json()
    # ticker = ""
    # for res in jsonData["organic_results"]:
    #     if res["domain"] == "finance.yahoo.com":
    #         ticker = res["displayed_link"].split(" › ")[-1]
    #         break
    # return jsonify({"ticker": ticker})
    return jsonify({"ticker": "TSLA"})


@app.route("/stock", methods=["POST"])
def getStockData():
    ticker = request.get_json()["ticker"]
    data = yf.Ticker(ticker).history(period="1d")
    return jsonify({"currentPrice": data.iloc[-1].Close})


@app.route("/massStock", methods=["POST"])
def getMassStockData():
    tickers = request.get_json()["tickers"].split()
    prices = {}
    for ticker in tickers:
        data = yf.Ticker(ticker).history(period="1d")
        prices[ticker] = data.iloc[-1].Close
    return jsonify(prices)


@app.route("/send-email", methods=["POST"])
def send_email():
    data = request.json
    stock_symbol = data["symbol"]
    target_price = data["targetPrice"]
    current_price = get_stock_price(stock_symbol)

    if current_price <= target_price:
        send_stock_alert(stock_symbol, current_price)
        return jsonify({"message": "Email sent successfully!"}), 200
    else:
        return jsonify({"message": "Stock price has not hit the target."}), 200


@app.route("/check-and-send-email", methods=["POST"])
def send_stock_alert():
    print("Attempting to send email...")
    data = request.get_json()
    print(data)
    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as smtp:
            smtp.ehlo()
            smtp.starttls()
            smtp.login(EMAIL_ADDRESS, EMAIL_PASSWORD)

            subject = f"Stock Alert for {data["symbol"]}"
            body = f"The stock price for {data["symbol"]} has reached {data["currentPrice"]}."
            msg = f"Subject: {subject}\n\n{body}"
            smtp.sendmail(
                EMAIL_ADDRESS, EMAIL_ADDRESS, msg
            )  # Sending email to yourself for testing
            print("Email sent successfully!")
    except Exception as e:
        print(f"An error occurred: {e}")


if __name__ == "__main__":
    app.run(debug=True)
