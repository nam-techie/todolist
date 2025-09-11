import React from 'react';
import { Trees, Sprout, TreePine, TreeDeciduous } from 'lucide-react';
import { ForestTree } from '../services/focusForestService';

interface ForestVisualizationProps {
  trees: ForestTree[];
  isCompact?: boolean;
}

const TreeIcon = ({ tree, size = 'w-6 h-6' }: { tree: ForestTree; size?: string }) => {
  const getTreeIcon = () => {
    switch (tree.type) {
      case 'sapling':
        return <Sprout className={`${size} text-green-300`} />;
      case 'young':
        return <TreePine className={`${size} text-green-400`} />;
      case 'mature':
        return <TreeDeciduous className={`${size} text-green-500`} />;
      case 'ancient':
        return <Trees className={`${size} text-green-600`} />;
      default:
        return <Sprout className={`${size} text-green-300`} />;
    }
  };

  const getTreeColor = () => {
    switch (tree.type) {
      case 'sapling': return 'text-green-300';
      case 'young': return 'text-green-400';
      case 'mature': return 'text-green-500';
      case 'ancient': return 'text-green-600';
      default: return 'text-green-300';
    }
  };

  return (
    <div 
      className={`inline-block ${getTreeColor()} transition-all duration-300 hover:scale-110`}
      title={`${tree.type.charAt(0).toUpperCase() + tree.type.slice(1)} tree (${tree.duration} min)`}
    >
      {getTreeIcon()}
    </div>
  );
};

function ForestVisualization({ trees, isCompact = false }: ForestVisualizationProps) {
  if (trees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-gray-400">
        <Trees className="w-12 h-12 mb-2 opacity-50" />
        <p className="text-sm">No trees planted yet</p>
        <p className="text-xs">Complete focus sessions to grow your forest!</p>
      </div>
    );
  }

  if (isCompact) {
    return (
      <div className="flex flex-wrap gap-1">
        {trees.slice(0, 12).map((tree) => (
          <TreeIcon key={tree.id} tree={tree} size="w-4 h-4" />
        ))}
        {trees.length > 12 && (
          <span className="text-xs text-gray-400 ml-1">
            +{trees.length - 12} more
          </span>
        )}
      </div>
    );
  }

  // Group trees by type for better visualization
  const treesByType = trees.reduce((acc, tree) => {
    acc[tree.type] = (acc[tree.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4">
      {/* Forest Grid */}
      <div className="bg-gradient-to-b from-green-900/20 to-green-800/20 rounded-lg p-4 border border-green-500/20">
        <div className="grid grid-cols-8 gap-2 max-h-48 overflow-y-auto">
          {trees.map((tree) => (
            <TreeIcon key={tree.id} tree={tree} />
          ))}
        </div>
      </div>

      {/* Tree Statistics */}
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(treesByType).map(([type, count]) => (
          <div key={type} className="bg-gray-700 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center mb-1">
              <TreeIcon 
                tree={{ type: type as ForestTree['type'] } as ForestTree} 
                size="w-5 h-5" 
              />
            </div>
            <div className="text-sm font-medium text-white">{count}</div>
            <div className="text-xs text-gray-400 capitalize">{type}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ForestVisualization;

