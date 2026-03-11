import type { StationMedia } from '../../data/mapData';
import MockupFrame from './MockupFrame';
import ArchitectureDiagram from './ArchitectureDiagram';
import GitHubSparkline from './GitHubSparkline';

type Props = {
  media: StationMedia;
  compact?: boolean;
};

export default function StationMediaPanel({ media, compact = false }: Props) {
  return (
    <div className={`flex flex-col ${compact ? 'gap-3' : 'gap-4'}`}>
      {media.mockup && <MockupFrame type={media.mockup} compact={compact} />}
      {media.architecture && (
        <ArchitectureDiagram diagram={media.architecture} compact={compact} />
      )}
      {media.github && <GitHubSparkline repo={media.github} compact={compact} />}
    </div>
  );
}
