import React, { memo } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface TargetTimes {
  target1: string
  target2: string
  target3: string
}

interface SettingsPanelProps {
  targetTimes: TargetTimes
  onTargetTimesChange: (targetTimes: TargetTimes) => void
}

const SettingsPanel = memo(({ targetTimes, onTargetTimesChange }: SettingsPanelProps) => {
  const handleChange = (key: keyof TargetTimes, value: string) => {
    onTargetTimesChange({
      ...targetTimes,
      [key]: value
    })
  }

  return (
    <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <h2 className="text-lg font-semibold mb-4 dark:text-gray-200">Zielzeiten anpassen</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="target1">Zielzeit 1</Label>
          <Input
            id="target1"
            type="time"
            value={targetTimes.target1}
            onChange={(e) => handleChange('target1', e.target.value)}
            className="text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="target2">Zielzeit 2</Label>
          <Input
            id="target2"
            type="time"
            value={targetTimes.target2}
            onChange={(e) => handleChange('target2', e.target.value)}
            className="text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="target3">Zielzeit 3</Label>
          <Input
            id="target3"
            type="time"
            value={targetTimes.target3}
            onChange={(e) => handleChange('target3', e.target.value)}
            className="text-sm"
          />
        </div>
      </div>
    </div>
  )
})

SettingsPanel.displayName = 'SettingsPanel'

export default SettingsPanel