const switchColumnsCtrl__EVENT = () => {
  let contentColumns__el = zooq.elements("contentColumns");
  let contentColumns__children = Array.from(zooq.elements("contentColumns").children);
  let farRightCards__el = contentColumns__children.pop();
  if (farRightCards__el.children.length > 1) {
    contentColumns__el.removeChild(contentColumns__el.lastChild);
    contentColumns__el.insertBefore(farRightCards__el, contentColumns__el.childNodes[0]);
  }
}
