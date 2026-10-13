import React from 'react';
import * as Icons from 'lucide-react';

export default function CategoryIcon({ name, className = 'w-5 h-5', style }) {
  // Find component in lucide-react or fallback
  const IconComponent = Icons[name] || Icons.MoreHorizontal;
  return <IconComponent className={className} style={style} />;
}
