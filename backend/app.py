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


@app.route("/check-and-send-email", methods=["POST"])
def check_and_send_email():
    data = request.json
    symbol = data.get('symbol')
    target_low = data.get('targetLow')
    target_high = data.get('targetHigh')

    # Fetch the current stock price
    current_price = get_stock_price(symbol)

    # Check if the current price is within the range
    if target_low <= current_price <= target_high:
        send_stock_alert(symbol, current_price)
        return jsonify({"message": "Email sent successfully!"}), 200
    else:
        return jsonify({"message": "Stock price is not within the target range."}), 200

#this gets the current stock price using the ticker 
def get_stock_price(symbol):
    data = yf.Ticker(symbol).history(period="1d")
    return data['Close'].iloc[-1]




def send_stock_alert(symbol, price):
    print("Attempting to send email...")
    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as smtp:
            smtp.ehlo()
            smtp.starttls()
            smtp.login(EMAIL_ADDRESS, EMAIL_PASSWORD)

            subject = f"Stock Alert for {symbol}"
            body = f"The stock price for {symbol} has reached {price}."
            msg = f"Subject: {subject}\n\n{body}"
            smtp.sendmail(
                EMAIL_ADDRESS, EMAIL_ADDRESS, msg
            )  # Sending email to yourself for testing
            print("Email sent successfully!")
    except Exception as e:
        print(f"An error occurred: {e}")


if __name__ == "__main__":
    app.run(debug=True)
