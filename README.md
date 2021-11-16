# iproxy-cli

```shell
npm install -g iproxy-cli
```

## iproxy.config.js

Put your proxy rule in `iproxy.config.js`.

```js
module.exports = {
    id: 'rule id',
    name: 'rule name',
    rule: `# Rule contnet`,
};
```

## enable

Run `iproxy` to active rule, ctrl-c to interrupt program then disable rule.