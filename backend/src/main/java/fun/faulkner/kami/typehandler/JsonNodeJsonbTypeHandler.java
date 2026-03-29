package fun.faulkner.kami.typehandler;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.MappedJdbcTypes;
import org.apache.ibatis.type.MappedTypes;

import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;

@MappedTypes(JsonNode.class)
@MappedJdbcTypes(JdbcType.OTHER)
public class JsonNodeJsonbTypeHandler extends BaseTypeHandler<JsonNode> {
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper().findAndRegisterModules();

    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, JsonNode parameter, JdbcType jdbcType)
            throws SQLException {
        try {
            ps.setObject(i, OBJECT_MAPPER.writeValueAsString(parameter), Types.OTHER);
        } catch (JsonProcessingException ex) {
            throw new SQLException("Failed to serialize JsonNode for jsonb column", ex);
        }
    }

    @Override
    public JsonNode getNullableResult(ResultSet rs, String columnName) throws SQLException {
        return readJsonNode(rs.getString(columnName));
    }

    @Override
    public JsonNode getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        return readJsonNode(rs.getString(columnIndex));
    }

    @Override
    public JsonNode getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        return readJsonNode(cs.getString(columnIndex));
    }

    private JsonNode readJsonNode(String rawJson) throws SQLException {
        if (rawJson == null || rawJson.isBlank()) {
            return null;
        }

        try {
            return OBJECT_MAPPER.readTree(rawJson);
        } catch (JsonProcessingException ex) {
            throw new SQLException("Failed to deserialize jsonb column to JsonNode", ex);
        }
    }
}
