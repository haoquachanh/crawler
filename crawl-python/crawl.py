import requests
from bs4 import BeautifulSoup

url = "https://quotes.toscrape.com"
res = requests.get(url)
soup = BeautifulSoup(res.text, "html.parser")

for q in soup.select(".quote"):
    text = q.select_one(".text").get_text(strip=True)
    author = q.select_one(".author").get_text(strip=True)
    print(text, "-", author)
