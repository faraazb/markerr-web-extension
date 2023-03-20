// el("div", "hello world!")
// el("div", {onclick: update})
// el("div", [])
// 
// el("", attrs, child)
// el("", children, text)
// el ("", attrs, text)
//
// argument(s) can be dropped but must strictly follow order
// ele, attributes, children, innerText

const regexEl = /^([^#\.\n]+)(.|#)?/gm;
const regexCssId = /#([^.#\n]+)/gm;
const regexCssClass = /\.([^.#\n]+)/gm;

export default function el(ele, attrs, children, text) {
    let selector = ele;
    let attributes = attrs;
    let innerText = text;
    let childEl = children;
    // ele, text
    if (typeof attrs === "string") {
        innerText = attrs;
        attributes = null;
    }
    // ele, children
    if (Array.isArray(attrs)) {
        childEl = attrs;
        attributes = null;
    }
    // ele, attrs, text | ele, children, text
    if (typeof children === "string") {
        innerText = children;
    }

    const { e: element, i: id, c: classNames } = parseSelector(selector);
    const e = document.createElement(element);
    if (id) {
        e.id = id;
    }
    if (classNames.length > 0) {
        e.classList.add(...classNames);
    }
    if (innerText) {
        e.innerText = innerText;
    }
    if (typeof attributes === "object" && !Array.isArray(attributes) && attributes !== null) {
        for (const [attr, value] of Object.entries(attributes)) {
            // hack - since both [] and setAttribute cannot set ALL properties
            if (attr.includes("data-")) {
                e.setAttribute(attr, value)
            }
            else {
                e[attr.toLowerCase()] = value;
            }
        }
    }
    if (Array.isArray(childEl)) {
        childEl.forEach((f) => e.appendChild(f));
    }
    return e;
}


function parseSelector(selector) {
    // get first grp of each match [1], then get first element [0]
    let element = Array.from(selector.matchAll(regexEl), m => m[1])[0];
    let classes = [];
    for (const match of selector.matchAll(regexCssClass)) {
        classes.push(match[1])
    }
    let id = Array.from(selector.matchAll(regexCssId), m => m[1])[0];
    return { e: element, i: id, c: classes }
}


export function icon(ele, svgString) {
    const e = el(ele);
    e.innerHTML = svgString;
    return e;
}

// const append = function (el) {
//     console.log(el);
//     document.body.appendChild(el);
// }

// append(el("div", "Hello world!"));
// append(el("div#main", { style: "background-color: red" }));
// append(el("div.hello", [el("div.world", "Wow, this worked")]));

// append(el("div", { onclick: () => console.log("hello world") }, [el("p.para", "This is an onlick div")]));
// append(el("div", [el("p", "Hiii!!")], "Inner hi will come before para"))

// append(el("div", { onclick: () => console.log("hello world") }, [el("p.para", "This is an onlick div")], "Inner text"));