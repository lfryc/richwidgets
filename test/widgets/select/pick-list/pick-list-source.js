define(['widget-test-base', 'jquery', 'jquery-ui', 'src/widgets/select/orderingList', 'src/widgets/select/pickList'], function () {

  describe("widget(pickList): source", function () {

    beforeEach(function () {
      var f = jasmine.getFixtures();
      f.load('test/widgets/select/pick-list/pick-list-source.html');

      var s = jasmine.getStyleFixtures();
      s.load('dist/assets/bootstrap/bootstrap.css');
      s.load('dist/assets/font-awesome/font-awesome.css');
      s.load('dist/assets/richfaces/select/select-list.css');
      s.load('dist/assets/richfaces/select/ordering-list.css');
      s.load('dist/assets/richfaces/select/pick-list.css');
    });

    it("pick-list from <ol> markup", function () {
      // given
      var fixture = $("#fixture-pick-list-list");
      var original = fixture.clone();
      var element = $("#list", fixture);
      var expected = $("#expected-pick-list-list");
      var options = {
        header: "List layout" //caption
      };
      // when
      element.pickList(options);
      // then
      expect(fixture).toHaveEqualDom(expected);
      // when
      element.pickList('destroy');
      // then
      expect(fixture).toHaveEqualDom(original);
    });

    it("pickList from <table> markup", function () {
      // given
      var fixture = $("#fixture-pick-list-table");
      var original = fixture.clone();
      var element = $("#table", fixture);
      var expected = $("#expected-pick-list-table");
      var options = {
        header: "Table layout" //caption
      };
      // when
      element.pickList(options);
      // then
      expect(fixture).toHaveEqualDom(expected);
      // when
      element.pickList('destroy');
      // then
      expect(fixture).toHaveEqualDom(original);
    });

  });
});