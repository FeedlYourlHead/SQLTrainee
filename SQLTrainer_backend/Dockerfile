FROM python:3.12-slim

ADD . /server/

WORKDIR /server

RUN apt-get update && apt-get install -y 

COPY requirements.txt /server

RUN pip install -r requirements.txt

COPY . /server

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
