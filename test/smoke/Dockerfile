FROM alpine

RUN apk add curl && \
    addgroup -S smoketest && adduser -S smoketest -G smoketest

COPY --chown=smoketest:smoketest smoke-test.sh smoke-test.sh

USER smoketest

CMD ["sh", "smoke-test.sh", "http://app:3000"]