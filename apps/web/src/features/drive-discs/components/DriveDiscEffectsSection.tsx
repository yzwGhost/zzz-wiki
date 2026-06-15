import { Typography } from 'antd';
import type { DriveDisc } from '@shared/schemas/catalog';
import { SectionCard } from '@/components/SectionCard';

const { Paragraph } = Typography;

interface DriveDiscEffectsSectionProps {
  driveDisc: DriveDisc;
}

export function DriveDiscEffectsSection({ driveDisc }: DriveDiscEffectsSectionProps) {
  return (
    <SectionCard
      title="套装效果"
      description="这一页先固定为资料分区，后续可以继续补词条建议、主词条优先级和实战说明。"
    >
      <Paragraph>2 件套：{driveDisc.two_piece_effect}</Paragraph>
      <Paragraph>4 件套：{driveDisc.four_piece_effect}</Paragraph>
    </SectionCard>
  );
}
