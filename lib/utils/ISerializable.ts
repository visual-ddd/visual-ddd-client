/**
 * 可序列化接口
 */
export interface ISerializable<D> {
  fromJSON(data: D): void;
  toJSON(): D;
}
