module.exports = function () {

    this.getRandomInt = function() {
        var min = 1;
        var max = 100;
        return Math.floor(Math.random() * (max - min)) + min;
    }

};