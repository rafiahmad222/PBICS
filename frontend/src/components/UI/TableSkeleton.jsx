import React from 'react';
import { Skeleton } from 'primereact/skeleton';

/**
 * TableSkeleton Component
 * 
 * A reusable skeleton component tailored for the clinic's table and card views.
 * 
 * @param {number} rows - Number of skeleton rows to render.
 * @param {string} mode - 'table' for desktop row layout, 'card' for mobile card layout.
 * @param {number} columns - Number of columns for table mode (default 5).
 */
const TableSkeleton = ({ rows = 5, mode = 'table', columns = 5 }) => {
    const renderTableContent = () => (
        <>
            <thead className="bg-gray-50/50">
                <tr className="border-b border-primary/5">
                    {[...Array(columns)].map((_, j) => (
                        <th key={j} className="px-4 py-4">
                            <Skeleton 
                                width={j === 0 ? '50%' : '30%'} 
                                height="0.6rem" 
                                className="!bg-primary/10" 
                            />
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
                {[...Array(rows)].map((_, i) => (
                    <tr key={i} className={i % 2 === 1 ? 'bg-primary/[0.01]' : ''}>
                        {[...Array(columns)].map((_, j) => (
                            <td key={j} className="px-4 py-5">
                                <Skeleton 
                                    width={j === 0 ? '70%' : j === columns - 1 ? '45%' : '85%'} 
                                    height="1.5rem" 
                                    borderRadius="0.75rem" 
                                    className="!bg-primary/5 animate-shimmer"
                                />
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </>
    );

    const renderCards = () => (
        <div className="divide-y divide-primary/5">
            {[...Array(rows)].map((_, i) => (
                <div key={i} className="p-6 space-y-5">
                    <div className="flex justify-between items-start gap-4">
                        <div className="flex items-center gap-4 flex-1">
                            <Skeleton shape="circle" size="3.5rem" className="!bg-primary/10 animate-shimmer shrink-0" />
                            <div className="flex-1 space-y-3">
                                <Skeleton width="85%" height="1.85rem" borderRadius="1rem" className="!bg-primary/10 animate-shimmer" />
                                <Skeleton width="55%" height="1.1rem" borderRadius="1rem" className="!bg-primary/5 animate-shimmer" />
                            </div>
                        </div>
                        <Skeleton width="5rem" height="2.25rem" borderRadius="1.25rem" className="!bg-primary/10 animate-shimmer" />
                    </div>
                    <div className="flex gap-4">
                        <Skeleton width="100%" height="3.5rem" borderRadius="1.5rem" className="!bg-primary/5 animate-shimmer" />
                        <Skeleton width="100%" height="3.5rem" borderRadius="1.5rem" className="!bg-primary/5 animate-shimmer" />
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="w-full bg-white rounded-3xl overflow-hidden">
            {mode === 'table' ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        {renderTableContent()}
                    </table>
                </div>
            ) : (
                renderCards()
            )}
        </div>
    );
};

export default TableSkeleton;
