import {shallow} from "enzyme";
import {Map, fromJS} from "immutable";
import {Content} from "native-base";
import Swiper from "react-native-swiper";

import ChartConsumption from "components/chart-consumption";
import Weather from "components/weather";
import Home from "views/home";

describe("`Home` view", () => {

    const HomeView = Home.__get__("Home");

    const asteroid = {};
    const collections = fromJS({});
    const home = {
        charts: [{
            sensorId: "sensorId",
            source: "source",
            day: "day",
            measurementType: "measurementType"
        }]
    };
    const toggleForecast = sinon.spy();
    const Dimensions = {
        get: sinon.stub().returns({height: 100})
    };
    const getDailySumConsumption = sinon.stub().returns(1);
    var homeView;

    let clock;

    before(() => {
        Home.__Rewire__("Dimensions", Dimensions);
        Home.__Rewire__("getDailySumConsumption", getDailySumConsumption);
        clock = sinon.useFakeTimers();
    });

    beforeEach(() => {
        toggleForecast.reset();
        Dimensions.get.reset();
        homeView = shallow(
            <HomeView
                asteroid={asteroid}
                collections={collections}
                home={home}
                toggleForecast={toggleForecast}
            />
        );
    });

    after(() => {
        Home.__ResetDependency__("Dimensions");
        Home.__ResetDependency__("getDailySumConsumption");
        clock.restore();
    });

    it("renders a `Content` component", () => {
        expect(homeView.find(Content)).to.have.length(1);
    });

    it("renders a `Swiper` component", () => {
        expect(homeView.find(Swiper)).to.have.length(1);
    });

    it("renders a `Swiper` with 2 children", () => {
        expect(homeView.find(Swiper).children()).to.have.length(2);
    });

    it("renders a `Weather` component", () => {
        expect(homeView.find(Weather)).to.have.length(1);
    });

    it("renders a `ChartConsumption` component", () => {
        expect(homeView.find(ChartConsumption)).to.have.length(1);
    });

    it("renders a `Swiper` with `ChartConsumption` component in the second children", () => {
        const swiper = homeView.find(Swiper);
        const secondSwiperChildren = swiper.children().at(1);
        expect(secondSwiperChildren.find(ChartConsumption)).to.have.length(1);
    });

    it("renders a `ChartConsumption` component with correct props [CASE: collections are defined]", () => {
        const collectionsWithAggregate = fromJS({
            "readings-daily-aggregates": {
                "_id": "sensorId-day-source-measurementType"
            },
            "consumptions-yearly-aggregates": {
                "_id": "sensorId-year-source-measurementType"
            }
        });
        const homeWrp = shallow(
            <HomeView
                asteroid={asteroid}
                collections={collectionsWithAggregate}
                home={home}
                toggleForecast={toggleForecast}
            />
        );
        expect(homeWrp.find(ChartConsumption).props()).to.deep.equal({
            charts: [{
                sensorId: "sensorId",
                source: "source",
                day: "day",
                measurementType: "measurementType"
            }],
            consumptionAggregates: fromJS({"_id": "sensorId-year-source-measurementType"}),
            dailyAggregates: fromJS({"_id": "sensorId-day-source-measurementType"}),
            heightSwiper: 60,
            isForecastData: false,
            isStandbyData: false,
            onToggleSwitch: toggleForecast
        });
    });

    it("renders a `ChartConsumption` component with correct props [CASE: collections are not defined]", () => {
        expect(homeView.find(ChartConsumption).props()).to.deep.equal({
            charts: [{
                sensorId: "sensorId",
                source: "source",
                day: "day",
                measurementType: "measurementType"
            }],
            consumptionAggregates: Map(),
            dailyAggregates: Map(),
            heightSwiper: 60,
            isForecastData: false,
            isStandbyData: false,
            onToggleSwitch: toggleForecast
        });
    });

    describe("`componentDidMount` method", () => {

        const componentDidMount = HomeView.prototype.componentDidMount;

        it("calls asteroid's `subscribe` method to sites collections", () => {
            const subscribe = sinon.spy();
            const props = {
                asteroid: {subscribe}
            };
            const subscribeToMeasure = sinon.spy();
            const instance = {
                props,
                subscribeToMeasure
            };
            componentDidMount.call(instance);
            expect(subscribe).to.have.callCount(1);
            expect(subscribe).to.have.been.calledWithExactly("sites");
        });

        it("calls `subscribeToMeasure` with `props` as arguments if site prop is not empty", () => {
            const subscribe = sinon.spy();
            const props = {
                asteroid: {subscribe},
                site: "site"
            };
            const subscribeToMeasure = sinon.spy();
            const instance = {
                props,
                subscribeToMeasure
            };
            componentDidMount.call(instance);
            expect(subscribeToMeasure).to.have.callCount(1);
            expect(subscribeToMeasure).to.have.been.calledWithExactly(props);
        });

        it("doesn't call `subscribeToMeasure` with `props` as arguments if site prop is empty", () => {
            const subscribe = sinon.spy();
            const props = {
                asteroid: {subscribe}
            };
            const subscribeToMeasure = sinon.spy();
            const instance = {
                props,
                subscribeToMeasure
            };
            componentDidMount.call(instance);
            expect(subscribeToMeasure).to.have.callCount(0);
        });

    });

    describe("`componentWillReceiveProps` method", () => {

        const componentWillReceiveProps = HomeView.prototype.componentWillReceiveProps;

        it("calls `subscribeToMeasure` and `setState` with `props` as arguments if `site` in `nextProps` is not empty", () => {
            const subscribe = sinon.spy();
            const isForecastData = sinon.stub().returns(true);
            const isStandbyData = sinon.stub().returns(true);
            const setState = sinon.spy();
            const nextProps = {
                asteroid: {subscribe},
                site: "site"
            };
            const subscribeToMeasure = sinon.spy();
            const instance = {
                subscribeToMeasure,
                isForecastData,
                isStandbyData,
                setState
            };
            componentWillReceiveProps.call(instance, nextProps);
            expect(subscribeToMeasure).to.have.callCount(1);
            expect(subscribeToMeasure).to.have.been.calledWithExactly(nextProps);
        });

        it("doesn't call `subscribeToMeasure` with `props` as arguments if `site` in `nextProps` is empty", () => {
            const subscribe = sinon.spy();
            const nextProps = {
                asteroid: {subscribe}
            };
            const subscribeToMeasure = sinon.spy();
            const instance = {
                subscribeToMeasure
            };
            componentWillReceiveProps.call(instance, nextProps);
            expect(subscribeToMeasure).to.have.callCount(0);
        });

    });

    describe("`isForecastData` function", () => {

        const isForecastData = HomeView.prototype.isForecastData;

        it("return false if forecast data is not present", () => {

            const aggregates = fromJS({});

            const instance = {
                props: {
                    collections: aggregates,
                    home: {
                        charts: [{
                            sensorId: "sensorId",
                            source: "reading",
                            day: "1970-01-01",
                            measurementType: "activeEnergy"
                        }]
                    }
                },
            };

            const ret = isForecastData.call(instance);
            expect(ret).to.equal(false);
        });

        it("return true if forecast data is present", () => {

            const aggregates = fromJS({
                "readings-daily-aggregates": {
                    "sensorId-1970-01-01-forecast-activeEnergy": {
                        "_id": "sensorId-standby-1970-01-01-forecast-activeEnergy"
                    }
                }
            });

            const instance = {
                props: {
                    collections: aggregates,
                    home: {
                        charts: [{
                            sensorId: "sensorId",
                            source: "forecast",
                            day: "1970-01-01",
                            measurementType: "activeEnergy"
                        }]
                    }
                },
            };

            const ret = isForecastData.call(instance);
            expect(ret).to.equal(true);
        });

    });

    describe("`isStandbyData` function", () => {

        const isStandbyData = HomeView.prototype.isStandbyData;

        it("return false if standby data is not present", () => {

            const aggregates = fromJS({});

            const instance = {
                props: {
                    collections: aggregates,
                    home: {
                        charts: [{
                            sensorId: "sensorId",
                            source: "reading",
                            day: "1970-01-01",
                            measurementType: "activeEnergy"
                        }]
                    }
                },
            };

            const ret = isStandbyData.call(instance);
            expect(ret).to.equal(false);
        });

        it("return true if standby data is present", () => {

            const aggregates = fromJS({
                "readings-daily-aggregates": {
                    "sensorId-standby-1970-01-01-reading-activeEnergy": {
                        "_id": "sensorId-standby-1970-01-01-reading-activeEnergy"
                    }
                }
            });

            const instance = {
                props: {
                    collections: aggregates,
                    home: {
                        charts: [{
                            sensorId: "sensorId",
                            source: "reading",
                            day: "1970-01-01",
                            measurementType: "activeEnergy"
                        }]
                    }
                },
            };

            const ret = isStandbyData.call(instance);
            expect(ret).to.equal(true);
        });

    });

    describe("`onLogout` function", () => {

        const onLogout = HomeView.prototype.onLogout;

        it("calls `logout`", () => {
            const logout = sinon.spy();
            const instance = {
                props: {
                    asteroid: {logout}
                }
            };
            onLogout.call(instance);
            expect(logout).to.have.callCount(1);
        });

    });

    describe("`subscribeToMeasure` function", () => {

        var clock;
        before(() => {
            clock = sinon.useFakeTimers();
        });

        after(() => {
            clock.restore();
        });

        const subscribeToMeasure = HomeView.prototype.subscribeToMeasure;

        it("calls asteroid's `subscribe` method with correct arguments", () => {
            const subscribe = sinon.spy();
            const props = {
                asteroid: {
                    subscribe
                },
                home: {
                    charts: [{
                        sensorId: "sensorId",
                        source: "reading",
                        measurementType: "activeEnergy",
                        day: "1970-01-01"
                    }, {
                        sensorId: "sensorId",
                        source: "forecast",
                        measurementType: "activeEnergy",
                        day: "1970-01-01"
                    }]
                }
            };
            subscribeToMeasure(props);
            expect(subscribe).to.have.callCount(10);
        });
    });

    describe("`getConsumptionAggregate` function", () => {

        const getConsumptionAggregate = HomeView.prototype.getConsumptionAggregate;
        const aggregates = fromJS({
            "readings-daily-aggregates": {
                "_id": "sensorId-day-source-measurementType"
            },
            "consumptions-yearly-aggregates": {
                "_id": "sensorId-year-source-measurementType"
            }
        });

        it("returns the correct aggregate [CASE: aggregate present in collections]", () => {
            const instance = {
                props: {
                    collections: aggregates
                }
            };
            const ret = getConsumptionAggregate.call(instance);
            expect(ret).to.deep.equal(fromJS({"_id": "sensorId-year-source-measurementType"}));
        });

        it("returns the correct aggregate [CASE: aggregate not present in collections]", () => {
            const instance = {
                props: {
                    collections
                }
            };
            const ret = getConsumptionAggregate.call(instance);
            expect(ret).to.deep.equal(Map());
        });

    });

    describe("`getDailyAggregate` function", () => {

        const getDailyAggregate = HomeView.prototype.getDailyAggregate;
        const aggregates = fromJS({
            "readings-daily-aggregates": {
                "_id": "sensorId-day-source-measurementType"
            },
            "consumptions-yearly-aggregates": {
                "_id": "sensorId-year-source-measurementType"
            }
        });

        it("returns the correct aggregate [CASE: aggregate present in collections]", () => {
            const instance = {
                props: {
                    collections: aggregates
                }
            };
            const ret = getDailyAggregate.call(instance);
            expect(ret).to.deep.equal(fromJS({"_id": "sensorId-day-source-measurementType"}));
        });

        it("returns the correct aggregate [CASE: aggregate not present in collections]", () => {
            const instance = {
                props: {
                    collections
                }
            };
            const ret = getDailyAggregate.call(instance);
            expect(ret).to.deep.equal(Map());
        });

    });

});
