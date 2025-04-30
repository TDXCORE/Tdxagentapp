"use client"

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "@/components/ui/chart"

export function LeadConversionChart() {
  // Sample data - in a real implementation, this would come from the database
  const data = [
    {
      name: "Jan",
      "Total Leads": 40,
      "Qualified Leads": 24,
      "PRDs Generated": 18,
      "Contracts Signed": 12,
    },
    {
      name: "Feb",
      "Total Leads": 45,
      "Qualified Leads": 28,
      "PRDs Generated": 20,
      "Contracts Signed": 15,
    },
    {
      name: "Mar",
      "Total Leads": 52,
      "Qualified Leads": 32,
      "PRDs Generated": 24,
      "Contracts Signed": 18,
    },
    {
      name: "Apr",
      "Total Leads": 58,
      "Qualified Leads": 36,
      "PRDs Generated": 28,
      "Contracts Signed": 22,
    },
    {
      name: "May",
      "Total Leads": 65,
      "Qualified Leads": 42,
      "PRDs Generated": 32,
      "Contracts Signed": 26,
    },
    {
      name: "Jun",
      "Total Leads": 70,
      "Qualified Leads": 46,
      "PRDs Generated": 36,
      "Contracts Signed": 30,
    },
  ]

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="Total Leads" fill="#8884d8" />
        <Bar dataKey="Qualified Leads" fill="#82ca9d" />
        <Bar dataKey="PRDs Generated" fill="#ffc658" />
        <Bar dataKey="Contracts Signed" fill="#ff8042" />
      </BarChart>
    </ResponsiveContainer>
  )
}
