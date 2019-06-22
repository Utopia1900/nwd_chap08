<h3>mark下：</h3>
之前因为noteedit.hbs模版中<input type='hidden' name='notekey' value='{{#if note }}{{notekey}}{{/if}} ' /> value值最后的空格问题，导致每次请求‘notes/save’时参数req.body.notekey总会多出一个空格导致错误，被一个空格折磨了好久。
