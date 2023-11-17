import datetime
from datetime import date
from PIL import Image

def getdate():
    today = date.today()
    day = today.day
    mydate = datetime.datetime.now()
    month = mydate.strftime("%B")
    year = today.year
    if day in (1, 21, 31):
        current_day = f"{day}st {month} {year}"
    elif day in (2, 22):
        current_day = f"{day}nd {month} {year}"
    elif day in (3, 23):
        current_day = f"{day}rd {month} {year}"
    else:
        current_day = f"{day}th {month} {year}"
    return current_day


def gettime():
    now = datetime.datetime.now()
    current_time = now.strftime("%H:%M:%S")
    hour = int(current_time[0:2])
    if hour > 12:
        new_time = str(hour - 12) + current_time[2:] + " pm"
    elif hour == 0:
        new_time = str(12) + current_time[2:] + " am"
    elif hour < 12:
        new_time = str(hour) + current_time[2:] + " am"
    elif hour == 12:
        new_time = str(12) + current_time[2:] + " pm"
    return new_time


