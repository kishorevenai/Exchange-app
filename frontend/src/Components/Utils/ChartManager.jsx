import React from "react";
import {
  ColorType,
  createChart as createLightWeightChart,
  CrosshairMode,
//   ISeriesApi,
  isUTCTimestamp,
} from "lightweight-charts";

export class ChartManager {
  #candleSeries;
  #lastUpdatedTime;
  #chart;
  #currentBar;
  constructor(ref, initialData, layout) {
    const chart = createLightWeightChart(ref, {
      autoSize: true,
      overlayPriceScales: {
        ticksVisible: true,
        borderVisible: true,
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        visible: true,
        ticksVisible: true,
        entireTextOnly: true,
      },
      grid: {
        horzLines: {
          visible: false,
        },
        vertLines: {
          visible: false,
        },
      },
      layout: {
        background: {
          type: ColorType.Solid,
          color: layout.background,
        },
        textColor: "white",
      },
    });

    this.#chart = chart;
    this.#candleSeries = chart.addCandlestickSeries();

    this.#candleSeries.setData(
      initialData.map((data) => ({
        ...data,
        time: data.timestamp / 1000,
      }))
    );
  }

  update(updatedPrice) {
    if (!this.#lastUpdatedTime) {
      this.#lastUpdatedTime = new Date().getTime();
    }

    this.#candleSeries.update({
      time: this.#lastUpdatedTime / 1000,
      close: updatedPrice.close,
      low: updatedPrice.low,
      high: updatedPrice.high,
      open: updatedPrice.open,
    });

    if (updatedPrice.newCandleInitiated) {
      this.#lastUpdatedTime = updatedPrice.time;
    }
  }

  destroy() {
    this.#chart.remove();
  }
}
