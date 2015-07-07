/**
 * Объект удовлетворяет заданному регулярному выражению.
 *
 * @constructor
 */
function IsRegexValidator() {

    this.message = null;
    this.property = null;
    this.pattern = null;

    /**
     * Проверяет объект.
     *
     * @public
     * @param {string} parentProperty Путь к проверяемому объекту.
     * @param {object} target Проверяемый объект.
     * @param {object} result Результат проверки.
     * @returns {boolean} Успешность проверки.
     */
    this.validate = function (parentProperty, target, result) {
        return generalValidate(this, parentProperty, target, result, function (validator, propertyValue) {
            return propertyValue !== null
                && propertyValue !== undefined
                && typeof propertyValue === "string"
                && new RegExp(validator.pattern).test(propertyValue);
        });
    }
}