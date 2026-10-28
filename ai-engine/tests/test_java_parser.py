from app.parser.java_parser import parse_java

SAMPLE = '''
/** Quan ly nguoi dung */
public class UserController {
    @GetMapping("/users")
    public List<User> list(int page) {
        if (page > 0) { return null; }
        return null;
    }
}
'''


def test_parse_java_finds_class_and_method():
    entities = parse_java(SAMPLE)
    pairs = [(e.kind, e.name) for e in entities]
    assert ("class", "UserController") in pairs
    assert ("method", "list") in pairs


def test_method_details():
    method = next(e for e in parse_java(SAMPLE) if e.kind == "method")
    assert method.parent == "UserController"
    assert method.annotations[0].startswith("@GetMapping")
    assert "list(int page)" in method.signature


def test_if_statement_is_not_a_method():
    names = [e.name for e in parse_java(SAMPLE)]
    assert "if" not in names