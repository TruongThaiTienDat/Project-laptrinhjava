from dataclasses import dataclass, field

import tree_sitter_java as tsjava
from tree_sitter import Language, Parser

_JAVA = Language(tsjava.language())
_parser = Parser(_JAVA)

TYPE_NODES = {
    "class_declaration": "class",
    "interface_declaration": "interface",
    "enum_declaration": "enum",
    "record_declaration": "record",
}
METHOD_NODES = {
    "method_declaration": "method",
    "constructor_declaration": "constructor",
}


@dataclass
class JavaEntity:
    kind: str
    name: str
    parent: str | None
    signature: str
    annotations: list[str] = field(default_factory=list)
    javadoc: str | None = None
    start_line: int = 0
    end_line: int = 0


def parse_java(source: str) -> list[JavaEntity]:
    data = source.encode("utf-8")
    tree = _parser.parse(data)
    entities: list[JavaEntity] = []

    def text(node) -> str:
        return data[node.start_byte:node.end_byte].decode("utf-8", errors="replace")

    def get_annotations(node) -> list[str]:
        mods = next((c for c in node.children if c.type == "modifiers"), None)
        if not mods:
            return []
        return [text(c) for c in mods.children
                if c.type in ("annotation", "marker_annotation")]

    def get_javadoc(node) -> str | None:
        prev = node.prev_named_sibling
        if prev and prev.type in ("block_comment", "comment"):
            comment = text(prev)
            if comment.startswith("/**"):
                return comment
        return None

    def walk(node, parent: str | None):
        kind = TYPE_NODES.get(node.type) or METHOD_NODES.get(node.type)
        next_parent = parent

        if kind:
            name_node = node.child_by_field_name("name")
            name = text(name_node) if name_node else "<unknown>"

            if kind in ("method", "constructor"):
                ret = node.child_by_field_name("type")
                params = node.child_by_field_name("parameters")
                signature = " ".join(
                    part for part in (
                        text(ret) if ret else "",
                        name + (text(params) if params else "()"),
                    ) if part
                )
            else:
                signature = name
                next_parent = name

            entities.append(JavaEntity(
                kind=kind,
                name=name,
                parent=parent,
                signature=signature,
                annotations=get_annotations(node),
                javadoc=get_javadoc(node),
                start_line=node.start_point[0] + 1,
                end_line=node.end_point[0] + 1,
            ))

        for child in node.children:
            walk(child, next_parent)

    walk(tree.root_node, None)
    return entities