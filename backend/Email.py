from flask import Flask, request, jsonify
import os
import smtplib
from dotenv import load_dotenv
import requests

load_dotenv()
app = Flask(__name__)

EMAIL_ADDRESS = os.getenv('Email_addy')
EMAIL_PASSWORD = os.getenv('Email_pass')

@app.route('/')
def home():
    return 'Welcome to My Flask Application!'

@app.route('/send-email', methods=['POST'])
def send_email():
    data = request.json
    stock_symbol = data['symbol']
    target_price = data['targetPrice']
    current_price = get_stock_price(stock_symbol)

    if current_price <= target_price:
        send_stock_alert(stock_symbol, current_price)
        return jsonify({"message": "Email sent successfully!"}), 200
    else:
        return jsonify({"message": "Stock price has not hit the target."}), 200

def get_stock_price(symbol):
    # Placeholder for your logic to fetch the stock price
    return 150

def send_stock_alert(symbol, price):
    print("Attempting to send email...")
    try:
        with smtplib.SMTP('smtp.gmail.com', 587) as smtp:
            smtp.ehlo()
            smtp.starttls()
            smtp.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            
            subject = f"Stock Alert for {symbol}"
            body = f"The stock price for {symbol} has reached {price}."
            msg = f'Subject: {subject}\n\n{body}'
            smtp.sendmail(EMAIL_ADDRESS, EMAIL_ADDRESS, msg)  # Sending email to yourself for testing
            print("Email sent successfully!")
    except Exception as e:
        print(f"An error occurred: {e}")


if __name__ == '__main__':
    app.run(debug=True)
