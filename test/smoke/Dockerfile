FROM alpine

RUN apk add curl

COPY smoke-test.sh smoke-test.sh

RUN adduser -D appuser
USER appuser

CMD ["sh", "smoke-test.sh", "http://app:3000"]