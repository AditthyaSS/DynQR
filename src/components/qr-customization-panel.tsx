'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { ChevronDown, ChevronUp, RotateCcw, AlertTriangle } from 'lucide-react'
import { QRPattern, QRCustomization, DEFAULT_QR_CUSTOMIZATION } from '@/hooks/use-qr-customization'

interface QRCustomizationPanelProps {
    customization: QRCustomization
    onForegroundColorChange: (color: string) => void
    onBackgroundColorChange: (color: string) => void
    onPatternChange: (pattern: QRPattern) => void
    onReset: () => void
    hasLowContrast: boolean
}

const PATTERN_OPTIONS: { value: QRPattern; label: string }[] = [
    { value: 'square', label: 'Square' },
    { value: 'rounded', label: 'Rounded' },
    { value: 'dots', label: 'Dots' },
]

export function QRCustomizationPanel({
    customization,
    onForegroundColorChange,
    onBackgroundColorChange,
    onPatternChange,
    onReset,
    hasLowContrast,
}: QRCustomizationPanelProps) {
    const [isExpanded, setIsExpanded] = useState(false)

    const isDefault =
        customization.foregroundColor === DEFAULT_QR_CUSTOMIZATION.foregroundColor &&
        customization.backgroundColor === DEFAULT_QR_CUSTOMIZATION.backgroundColor &&
        customization.pattern === DEFAULT_QR_CUSTOMIZATION.pattern

    return (
        <div className="space-y-3">
            {/* Toggle Button */}
            <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center justify-between w-full p-3 bg-purple-600/20 border border-purple-500/50 rounded-lg hover:bg-purple-600/30 transition-colors"
            >
                <span className="text-sm font-medium text-purple-300">
                    🎨 Customize QR (Optional)
                </span>
                {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-purple-400" />
                ) : (
                    <ChevronDown className="h-4 w-4 text-purple-400" />
                )}
            </button>

            {/* Expanded Panel */}
            {isExpanded && (
                <div className="p-4 bg-slate-700/20 rounded-lg space-y-4">
                    {/* Low Contrast Warning */}
                    {hasLowContrast && (
                        <div className="flex items-center gap-2 p-2 bg-amber-500/20 border border-amber-500/30 rounded-lg text-amber-400 text-sm">
                            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                            <span>Low contrast colors selected. Default colors will be used for scannability.</span>
                        </div>
                    )}

                    {/* Color Pickers */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-slate-300 text-sm">QR Color</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="color"
                                    value={customization.foregroundColor}
                                    onChange={(e) => onForegroundColorChange(e.target.value)}
                                    className="w-10 h-10 p-1 bg-slate-700 border-slate-600 rounded cursor-pointer"
                                />
                                <Input
                                    type="text"
                                    value={customization.foregroundColor.toUpperCase()}
                                    onChange={(e) => onForegroundColorChange(e.target.value)}
                                    className="flex-1 bg-slate-700/50 border-slate-600 text-white text-sm font-mono uppercase"
                                    maxLength={7}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-300 text-sm">Background</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="color"
                                    value={customization.backgroundColor}
                                    onChange={(e) => onBackgroundColorChange(e.target.value)}
                                    className="w-10 h-10 p-1 bg-slate-700 border-slate-600 rounded cursor-pointer"
                                />
                                <Input
                                    type="text"
                                    value={customization.backgroundColor.toUpperCase()}
                                    onChange={(e) => onBackgroundColorChange(e.target.value)}
                                    className="flex-1 bg-slate-700/50 border-slate-600 text-white text-sm font-mono uppercase"
                                    maxLength={7}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Pattern Selector */}
                    <div className="space-y-2">
                        <Label className="text-slate-300 text-sm">Pattern</Label>
                        <div className="flex gap-2">
                            {PATTERN_OPTIONS.map((option) => (
                                <Button
                                    key={option.value}
                                    type="button"
                                    variant={customization.pattern === option.value ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => onPatternChange(option.value)}
                                    className={
                                        customization.pattern === option.value
                                            ? 'bg-purple-600 hover:bg-purple-700'
                                            : 'border-slate-600 hover:bg-slate-700'
                                    }
                                >
                                    {option.label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Reset Button */}
                    {!isDefault && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onReset}
                            className="text-slate-400 hover:text-white"
                        >
                            <RotateCcw className="h-3 w-3 mr-1" />
                            Reset to Default
                        </Button>
                    )}
                </div>
            )}
        </div>
    )
}
