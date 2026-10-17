import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Placeholder } from '../components/Placeholder';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'UnitDetail'>;

export default function UnitDetailScreen({ route }: Props) {
  return (
    <Placeholder
      title="Unit Detail"
      subtitle={`Full profile for unit #${route.params.unitId}: stats, lore, uses, upgrades, and image.`}
    />
  );
}
