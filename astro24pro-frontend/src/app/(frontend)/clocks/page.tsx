'use client'

import React, { useEffect, useRef, useState } from 'react'


import Chart from '@astrodraw/astrochart'

const Page = () => {

  useEffect(() => {
    const chartEl = new Chart('chart', 600, 600)
    const data = {
      planets: {
        Pluto: [63],
        Neptune: [110],
        Uranus: [318],
        Saturn: [201],
        Jupiter: [192],
        Mars: [210],
        Moon: [268],
        Sun: [281],
        Mercury: [312],
        Venus: [330],
      },
      cusps: [296, 350, 30, 56, 75, 94, 116, 170, 210, 236, 255, 274],
    }
    chartEl.radix(data)
  }, [])

  return (
    <div>
      <div id="chart"></div>
    </div>
  )
}

export default Page
