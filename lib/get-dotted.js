function getDotted(obj, propertyName) {
  let parts = propertyName.split('.');

  let value = obj;

  for (let part of parts) {
    try {
      value = value[part];
    } catch (error) {
      return undefined;
    }
  }

  return value;
}

module.exports = { getDotted };
