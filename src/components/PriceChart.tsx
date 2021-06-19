import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AxisRight, AxisBottom } from '@visx/axis';
import { curveLinear } from '@visx/curve';
import { localPoint } from '@visx/event';
import { LinearGradient } from '@visx/gradient';
import { GridRows, GridColumns } from '@visx/grid';
import { scaleTime, scaleLinear } from '@visx/scale';
import { AreaClosed, Bar, Line, LinePath } from '@visx/shape';
import { withTooltip, TooltipWithBounds } from '@visx/tooltip';
import { WithTooltipProvidedProps } from '@visx/tooltip/lib/enhancers/withTooltip';
import { max, bisector, min, pairs } from 'd3-array';
import { format } from 'd3-format';
import { timeFormat } from 'd3-time-format';
import {
  scaleDiscontinuous,
  discontinuitySkipWeekends,
  discontinuityRange,
} from '@d3fc/d3fc-discontinuous-scale';
import { first, last } from 'lodash';
import { Button, ButtonGroup } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CustomTimePeriod from './CustomTimePeriod';
import MovingAverage from './MovingAverage';
import { useGlobalContext, TimePeriods } from '../context';

const { REACT_APP_FIN_URL: URL, REACT_APP_FIN_KEY: KEY } = process.env;
const QUOTE_URL = `${URL}/stock/candle?token=${KEY}`;

interface Stock {
  date: Date;
  close: number;
}

type ToolTipData = Stock;

// styles
const useStyles = makeStyles((theme) => ({
  maBtn: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
}));

// util
const formatDate = timeFormat('%d %b %y  %H:%M');
const formatStockValue = format('.2f');

// accessors
const getDate = (d: Stock) => d.date;
const getStockValue = (d: Stock) => d.close;
const bisectDate = bisector<Stock, Date>((d) => d.date).left;
const tradingHours = (dates: Date[]) => {
  const getDateKey = (date: Date) =>
    `${date.getUTCMonth()}-${date.getUTCDate()}-${date.getUTCFullYear()}`;

  const thrs = dates.reduce((acc: { [key: string]: [Date, Date] }, curr: Date) => {
    const dateKey = getDateKey(curr);
    if (!Object.prototype.hasOwnProperty.call(acc, dateKey)) {
      acc[dateKey] = [curr, curr];
    } else {
      acc[dateKey][1] = curr;
    }
    return acc;
  }, {});

  return Object.keys(thrs).map((d) => thrs[d]);
};

export type AreaProps = {
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
};

export default withTooltip<AreaProps, ToolTipData>(
  ({
    width,
    height,
    margin = { top: 10, right: 45, bottom: 30, left: 0 },
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipTop = 0,
    tooltipLeft = 0,
  }: AreaProps & WithTooltipProvidedProps<ToolTipData>) => {
    if (width < 10) return null;

    const { timePeriod, selectedSymbol, setTimePeriod } = useGlobalContext();

    if (!selectedSymbol) return null;

    const [priceData, setPriceData] = useState<Stock[]>([]);
    const [showMavg, setShowMavg] = useState(false);
    const [loading, setLoading] = useState(true);

    const classes = useStyles();

    // bounds
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    useEffect(() => {
      const { resolution, from, to } = timePeriod;
      fetch(
        `${QUOTE_URL}&symbol=${selectedSymbol.symbol}&resolution=${resolution}&from=${from}&to=${to}`
      )
        .then((res) => {
          if (!res.ok) {
            throw new Error('Could not fetch price data');
          }
          return res.json();
        })
        .then((data) => {
          if (data.s !== 'ok') {
            throw new Error('Could not fetch price data');
          }

          const { c: closePrices, t: timeStamps } = data;
          let stockData: Stock[] = [];
          if (closePrices && timeStamps) {
            for (let i = 0; i < closePrices.length; i++) {
              const date = new Date(timeStamps[i] * 1000);
              stockData.push({ date, close: closePrices[i] });
            }
          }
          if (resolution !== 'D' && resolution !== 'W')  {
            stockData = stockData.filter(
              (d) => d.date.getUTCHours() >= 13 && d.date.getUTCHours() < 20
            );
          }
          setPriceData(stockData);
          setLoading(false);
        })

        .catch((err) => console.log(err));
    }, [selectedSymbol, timePeriod]);

    const discontinuities = useMemo(
      () => pairs(tradingHours(priceData.map(({ date }) => date))).map((d) => [d[0][1], d[1][0]]),
      [priceData]
    );


    // scales
    const dateScale = useMemo(
      () => {
        const { resolution } = timePeriod;
        let discontinuityProvider = discontinuitySkipWeekends()
        if (resolution !== 'D' && resolution !== 'W') {
          discontinuityProvider = discontinuityRange(...discontinuities);
        }
        return scaleDiscontinuous(
          scaleTime({
            range: [margin.left, innerWidth + margin.left],
            domain: [min(priceData, getDate) || 0, max(priceData, getDate) || 0],
          })
        ).discontinuityProvider(discontinuityProvider);
      }        ,
      [discontinuities, innerWidth, margin.left, priceData, timePeriod]
    );

    const stockValueScale = useMemo(
      () =>
        scaleLinear({
          range: [innerHeight + margin.top, margin.top],
          domain: [
            (min(priceData, getStockValue) || 0) - 0.3,
            (max(priceData, getStockValue) || 0) + 0.3,
          ],
          nice: true,
        }),
      [priceData, margin.top, innerHeight]
    );

    const accentColor = useMemo(() => {
      const startPrice = first(priceData)?.close || 0;
      const endPrice = last(priceData)?.close || 0;
      if (startPrice > endPrice) {
        return '#ea4335';
      }
      return '#81c995';
    }, [priceData]);

    // tooltip handler
    const handleTooltip = useCallback(
      (event: React.TouchEvent<SVGRectElement> | React.MouseEvent<SVGRectElement>) => {
        const { x } = localPoint(event) || { x: 0 };
        const x0 = dateScale.invert(x);
        const index = bisectDate(priceData, x0, 1);
        const d0 = priceData[index - 1];
        const d1 = priceData[index];
        let d = d0;
        if (d1 && getDate(d1)) {
          d = x0.valueOf() - getDate(d0).valueOf() > getDate(d1).valueOf() - x0.valueOf() ? d1 : d0;
        }
        showTooltip({
          tooltipData: d,
          tooltipLeft: x,
          tooltipTop: stockValueScale(getStockValue(d)),
        });
      },
      [showTooltip, dateScale, stockValueScale, priceData]
    );

    if (loading) {
      return <div>Loading</div>;
    }

    return (
      <div>
        <svg width={width} height={height}>
          <rect x={0} y={0} width={width} height={height} rx={14} fill="white" />
          <LinearGradient
            id="area-gradient"
            from={accentColor}
            to={accentColor}
            fromOpacity={0.4}
            toOpacity={0.1}
          />
          <GridRows
            left={margin.left}
            scale={stockValueScale}
            width={innerWidth}
            strokeDasharray="1,3"
            stroke={accentColor}
            strokeOpacity={0.2}
            pointerEvents="none"
            numTicks={6}
          />
          <GridColumns
            top={margin.top}
            scale={dateScale}
            height={innerHeight}
            strokeDasharray="1,3"
            stroke={accentColor}
            strokeOpacity={0.2}
            pointerEvents="none"
            numTicks={6}
          />
          <AxisRight
            scale={stockValueScale}
            left={innerWidth + margin.left}
            tickFormat={formatStockValue}
            tickLength={4}
            numTicks={6}
          />
          <AxisBottom scale={dateScale} top={height - margin.bottom} numTicks={6} />
          <AreaClosed<Stock>
            data={priceData}
            x={(d) => dateScale(getDate(d)) ?? 0}
            y={(d) => stockValueScale(getStockValue(d)) ?? 0}
            yScale={stockValueScale}
            strokeWidth={0}
            stroke={accentColor}
            fill="url(#area-gradient)"
            curve={curveLinear}
            pointerEvents="none"
          />
          <LinePath
            data={priceData}
            curve={curveLinear}
            x={(d) => dateScale(getDate(d)) ?? 0}
            y={(d) => stockValueScale(getStockValue(d)) ?? 0}
            stroke={accentColor}
            strokeWidth={1.5}
          />
          <Bar
            x={margin.left}
            y={margin.top}
            width={innerWidth}
            height={innerWidth}
            fill="transparent"
            rx={14}
            onTouchStart={handleTooltip}
            onTouchMove={handleTooltip}
            onMouseMove={handleTooltip}
            onMouseLeave={() => hideTooltip()}
          />
          {showMavg && (
            <MovingAverage
              lineData={priceData.map((d) => ({ date: d.date, value: d.close }))}
              timeRange={{ x: margin.left, y: innerWidth + margin.left }}
              linearRange={{ x: innerHeight + margin.top, y: margin.top }}
            />
          )}
          {tooltipData && (
            <g>
              <Line
                from={{ x: tooltipLeft, y: margin.top }}
                to={{ x: tooltipLeft, y: innerHeight + margin.top }}
                stroke="#000"
                strokeWidth={1}
                pointerEvents="none"
                strokeDasharray="5,2"
              />
              <circle
                cx={tooltipLeft}
                cy={tooltipTop + 1}
                r={4}
                fill="black"
                fillOpacity={0.1}
                stroke="black"
                strokeOpacity={0.1}
                strokeWidth={2}
                pointerEvents="none"
              />
            </g>
          )}
        </svg>
        <Button
          className={classes.maBtn}
          size="small"
          variant="outlined"
          color="secondary"
          onClick={() => setShowMavg(!showMavg)}
        >
          Show MA
        </Button>
        {tooltipData && (
          <div>
            <TooltipWithBounds key={Math.random()} top={tooltipTop - 12} left={tooltipLeft + 12}>
              {`$${getStockValue(tooltipData)}`}
            </TooltipWithBounds>
            <TooltipWithBounds top={innerHeight + margin.top - 14} left={tooltipLeft}>
              {formatDate(getDate(tooltipData))}
            </TooltipWithBounds>
          </div>
        )}
        <ButtonGroup color="primary" size="small">
          {Object.values(TimePeriods).map((t) => (
            <Button
              key={t}
              onClick={() => setTimePeriod(t)}
              variant={timePeriod.resolution === t ? 'contained' : 'text'}
            >
              {t}
            </Button>
          ))}
          <CustomTimePeriod />
        </ButtonGroup>
      </div>
    );
  }
);
