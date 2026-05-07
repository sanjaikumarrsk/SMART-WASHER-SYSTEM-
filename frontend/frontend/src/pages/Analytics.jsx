import React from 'react'

export default function Analytics() {
  return (
    <div className="w-full h-screen bg-gray-100">
      <iframe
        src="https://us3.ca.analytics.ibm.com/bi/?perspective=dashboard&pathRef=.my_folders%2Fdashboard%2Fbi%2Bdashboard&closeWindowOnLastView=true&ui_appbar=false&ui_navbar=false&shareMode=embedded&action=view&mode=dashboard&subView=model0000019d25db9fff_00000000&nav_filter=true"
        className="w-full h-full border-0"
        allow="encrypted-media"
        allowFullScreen
        title="IBM Cognos Analytics Dashboard"
      />
    </div>
  )
}
