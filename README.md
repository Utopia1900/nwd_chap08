<h3>mark下</h3>
之前在noteedit.hbs模版：value='{{#if note }}{{notekey}}{{/if}} ', 因为value值最后的空格问题，导致每次请求‘notes/save’时参数req.body.notekey总会多出一个空格导致错误，被这个空格折磨了好久。