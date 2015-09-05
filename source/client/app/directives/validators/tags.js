app.directive('tags', function() {
  'use strict';
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, ngModel) {
      ngModel.$parsers.push(function(value) {
        var tags = value.split(',');
        tags = tags.filter(function (tag) {
            return /\S/.test(tag);
        });
        tags = tags.filter(function (tag, pos, self) {
          return self.indexOf(tag) === pos;
        });
        ngModel.$setValidity('tooManyTags', tags.length < 5);
        return value;
      });
    }
  };
});
